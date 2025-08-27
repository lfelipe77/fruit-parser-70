-- Fix the root cause: make reserve_tickets_v2 create tickets dynamically and add raffle publishing system

-- 1. Add published boolean to raffles table
ALTER TABLE public.raffles ADD COLUMN IF NOT EXISTS published BOOLEAN DEFAULT false;

-- 2. Set existing active/approved raffles as published by default
UPDATE public.raffles SET published = true WHERE status IN ('active', 'approved', 'scheduled');

-- 3. Drop existing approve_raffle function if it exists
DROP FUNCTION IF EXISTS public.approve_raffle(uuid);

-- 4. Create or replace reserve_tickets_v2 to dynamically create tickets if they don't exist
CREATE OR REPLACE FUNCTION public.reserve_tickets_v2(
  p_raffle_id UUID,
  p_qty INTEGER
)
RETURNS TABLE(
  reservation_id UUID,
  expires_at TIMESTAMPTZ,
  unit_price NUMERIC,
  total_amount NUMERIC,
  currency TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_r raffles%rowtype;
  v_uid uuid := auth.uid();
  v_res uuid := gen_random_uuid();
  v_expires timestamptz := now() + interval '15 minutes';
  v_reserved_count int := 0;
  v_available_count int;
  v_needed_tickets int;
  i int;
BEGIN
  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'auth required';
  END IF;

  IF p_qty IS NULL OR p_qty < 1 OR p_qty > 20 THEN
    RAISE EXCEPTION 'invalid quantity';
  END IF;

  -- Get raffle details with lock
  SELECT * INTO v_r FROM raffles WHERE id = p_raffle_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'raffle not found';
  END IF;

  -- Check if raffle is open for purchase and published
  IF v_r.status NOT IN ('approved','scheduled','active') THEN
    RAISE EXCEPTION 'raffle not open for purchase';
  END IF;
  
  IF COALESCE(v_r.published, false) = false THEN
    RAISE EXCEPTION 'raffle not published';
  END IF;

  -- Count existing available tickets
  SELECT COUNT(*) INTO v_available_count
  FROM tickets
  WHERE raffle_id = p_raffle_id AND status = 'issued';

  -- If we don't have enough tickets, create them up to the total_tickets limit
  IF v_available_count < p_qty THEN
    v_needed_tickets := p_qty - v_available_count;
    
    -- Make sure we don't exceed the raffle's total ticket limit
    SELECT COUNT(*) INTO v_available_count FROM tickets WHERE raffle_id = p_raffle_id;
    
    IF v_r.total_tickets IS NOT NULL AND (v_available_count + v_needed_tickets) > v_r.total_tickets THEN
      v_needed_tickets := GREATEST(0, v_r.total_tickets - v_available_count);
    END IF;

    -- Create the needed tickets
    FOR i IN 1..v_needed_tickets LOOP
      INSERT INTO tickets (
        raffle_id,
        status,
        ticket_number,
        unit_price,
        created_at
      ) VALUES (
        p_raffle_id,
        'issued',
        (SELECT COALESCE(MAX(ticket_number), 0) + 1 FROM tickets WHERE raffle_id = p_raffle_id),
        v_r.ticket_price,
        now()
      );
    END LOOP;
  END IF;

  -- Now reserve the tickets using the existing logic
  WITH candidate_tickets AS (
    SELECT id
    FROM tickets
    WHERE raffle_id = p_raffle_id
      AND status = 'issued'
    ORDER BY ticket_number ASC NULLS LAST
    LIMIT p_qty
    FOR UPDATE SKIP LOCKED
  )
  UPDATE tickets t
  SET 
    status = 'reserved',
    reserved_until = v_expires,
    reservation_id = v_res,
    reserved_by = v_uid,
    user_id = v_uid,
    updated_at = now()
  FROM candidate_tickets ct
  WHERE t.id = ct.id;

  GET DIAGNOSTICS v_reserved_count = ROW_COUNT;

  IF v_reserved_count < p_qty THEN
    RAISE EXCEPTION 'only % tickets available', v_reserved_count;
  END IF;

  -- Return the reservation details
  reservation_id := v_res;
  expires_at := v_expires;
  unit_price := v_r.ticket_price;
  total_amount := p_qty * v_r.ticket_price;
  currency := 'BRL';
  RETURN NEXT;
END;
$$;

-- 5. Create function to approve/publish raffles (admin only)
CREATE OR REPLACE FUNCTION public.approve_raffle(p_raffle_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  v_raffle raffles%rowtype;
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'admin only';
  END IF;

  -- Get raffle
  SELECT * INTO v_raffle FROM raffles WHERE id = p_raffle_id;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'raffle not found';
  END IF;

  -- Update raffle to published and active
  UPDATE raffles 
  SET 
    published = true,
    status = 'active',
    updated_at = now()
  WHERE id = p_raffle_id;

  -- Make any canceled tickets available again
  UPDATE tickets 
  SET status = 'issued'
  WHERE raffle_id = p_raffle_id 
    AND status = 'canceled';

  -- Log the approval
  INSERT INTO audit_logs (user_id, action, context)
  VALUES (
    auth.uid(),
    'raffle_approved',
    jsonb_build_object(
      'raffle_id', p_raffle_id,
      'raffle_title', v_raffle.title
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'raffle_id', p_raffle_id,
    'status', 'active',
    'published', true
  );
END;
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.reserve_tickets_v2(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION public.approve_raffle(UUID) TO authenticated;