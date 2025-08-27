-- Step 0: Make finalize_paid_purchase idempotent with advisory lock and early exits (FIXED)
CREATE OR REPLACE FUNCTION public.finalize_paid_purchase(
  p_reservation_id uuid,
  p_asaas_payment_id text,
  p_customer_name text DEFAULT NULL,
  p_customer_phone text DEFAULT NULL,
  p_customer_cpf text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_existing_tx uuid;
  v_reservation RECORD;
  v_raffle_id uuid;
  v_buyer_user_id uuid;
  v_numbers text[];
  v_qty int;
  v_unit_price numeric;
  v_total numeric;
  v_tx_id uuid;
BEGIN
  -- Guard: advisory lock per reservation to serialize finalization
  PERFORM pg_advisory_xact_lock(hashtext('finalize_reservation:' || coalesce(p_reservation_id::text,'-')));

  -- Early exit 1: same provider payment already finalized
  IF p_asaas_payment_id IS NOT NULL AND p_asaas_payment_id <> '' THEN
    SELECT id INTO v_existing_tx
    FROM public.transactions
    WHERE provider = 'asaas'
      AND provider_payment_id = p_asaas_payment_id
      AND status = 'paid'
    LIMIT 1;

    IF v_existing_tx IS NOT NULL THEN
      RETURN jsonb_build_object('ok', true, 'transaction_id', v_existing_tx, 'idempotent', true);
    END IF;
  END IF;

  -- Early exit 2: reservation already has a paid transaction
  IF p_reservation_id IS NOT NULL THEN
    SELECT id INTO v_existing_tx
    FROM public.transactions
    WHERE reservation_id = p_reservation_id
      AND status = 'paid'
    LIMIT 1;

    IF v_existing_tx IS NOT NULL THEN
      RETURN jsonb_build_object('ok', true, 'transaction_id', v_existing_tx, 'idempotent', true);
    END IF;
  END IF;

  -- Load reservation tickets still valid
  SELECT 
    COUNT(*) as ticket_count,
    t.raffle_id,
    t.user_id as buyer_user_id,
    ARRAY_AGG(COALESCE(t.ticket_number::text, '')) as numbers
  INTO v_reservation
  FROM public.tickets t
  WHERE t.reservation_id = p_reservation_id
    AND t.status = 'reserved'
    AND t.reserved_until > now()
  GROUP BY t.raffle_id, t.user_id;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('ok', false, 'error', 'reservation_not_found_or_expired');
  END IF;

  v_raffle_id := v_reservation.raffle_id;
  v_buyer_user_id := v_reservation.buyer_user_id;
  v_numbers := v_reservation.numbers;
  v_qty := COALESCE(array_length(v_numbers, 1), 0);

  -- Fetch unit price from raffle
  SELECT ticket_price INTO v_unit_price FROM public.raffles WHERE id = v_raffle_id LIMIT 1;
  v_total := COALESCE(v_unit_price, 0) * v_qty;

  -- Insert paid transaction and mark tickets as paid; catch unique violations for idempotency
  BEGIN
    INSERT INTO public.transactions (
      raffle_id,
      reservation_id,
      user_id,
      buyer_user_id,
      amount,
      status,
      provider,
      provider_payment_id,
      numbers,
      customer_name,
      customer_phone,
      customer_cpf
    ) VALUES (
      v_raffle_id,
      p_reservation_id,
      v_buyer_user_id,
      v_buyer_user_id,
      v_total,
      'paid',
      'asaas',
      NULLIF(p_asaas_payment_id, ''),
      COALESCE(to_jsonb(v_numbers), '[]'::jsonb),
      NULLIF(p_customer_name, ''),
      NULLIF(p_customer_phone, ''),
      NULLIF(p_customer_cpf, '')
    ) RETURNING id INTO v_tx_id;

  EXCEPTION WHEN unique_violation THEN
    -- Select existing transaction (by reservation or provider)
    SELECT id INTO v_tx_id
    FROM public.transactions
    WHERE (reservation_id = p_reservation_id AND status='paid')
       OR (provider='asaas' AND provider_payment_id = NULLIF(p_asaas_payment_id, '') AND status='paid')
    ORDER BY created_at DESC
    LIMIT 1;
  END;

  -- Mark tickets paid and attach transaction id
  UPDATE public.tickets k
  SET status = 'paid', transaction_id = v_tx_id, updated_at = now()
  WHERE k.reservation_id = p_reservation_id
    AND k.status = 'reserved';

  -- Upsert reservation audit cache if function exists
  BEGIN
    PERFORM public.upsert_reservation_audit(p_reservation_id);
  EXCEPTION WHEN undefined_function THEN
    -- Function doesn't exist, continue without error
    NULL;
  END;

  RETURN jsonb_build_object('ok', true, 'transaction_id', v_tx_id);
END;
$$;