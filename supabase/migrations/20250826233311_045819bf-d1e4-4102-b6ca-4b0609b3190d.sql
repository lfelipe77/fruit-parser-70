-- Fix finalize_paid_purchase function to handle NULL unit_price and get it from raffle
CREATE OR REPLACE FUNCTION public.finalize_paid_purchase(p_reservation_id uuid, p_asaas_payment_id text, p_customer_name text DEFAULT NULL::text, p_customer_phone text DEFAULT NULL::text, p_customer_cpf text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_reservation RECORD;
  v_raffle RECORD;
  v_ticket_numbers TEXT[];
  v_transaction_id UUID;
  v_total_amount NUMERIC;
  v_qty INTEGER;
  v_unit_price NUMERIC;
BEGIN
  -- Get reservation details with tickets
  SELECT 
    COUNT(*) as ticket_count,
    t.raffle_id,
    t.user_id as buyer_user_id,
    ARRAY_AGG(COALESCE(t.ticket_number::text, '')) as numbers
  INTO v_reservation
  FROM tickets t
  WHERE t.reservation_id = p_reservation_id 
    AND t.status = 'reserved'
    AND t.reserved_until > now()
  GROUP BY t.raffle_id, t.user_id;

  IF NOT FOUND OR v_reservation.ticket_count = 0 THEN
    RETURN jsonb_build_object('error', 'No valid reserved tickets found for reservation');
  END IF;

  -- Get raffle details including ticket price
  SELECT * INTO v_raffle FROM raffles WHERE id = v_reservation.raffle_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Raffle not found');
  END IF;

  v_qty := v_reservation.ticket_count;
  v_unit_price := v_raffle.ticket_price;
  v_total_amount := v_qty * v_unit_price;
  v_ticket_numbers := v_reservation.numbers;
  v_transaction_id := gen_random_uuid();

  -- Create transaction record
  INSERT INTO transactions (
    id,
    raffle_id,
    user_id,
    buyer_user_id,
    amount,
    status,
    provider,
    provider_payment_id,
    numbers,
    customer_name,
    customer_phone,
    customer_cpf,
    created_at
  ) VALUES (
    v_transaction_id,
    v_reservation.raffle_id,
    v_reservation.buyer_user_id,
    v_reservation.buyer_user_id,
    v_total_amount,
    'paid',
    'asaas',
    p_asaas_payment_id,
    to_jsonb(v_ticket_numbers),
    p_customer_name,
    p_customer_phone,
    p_customer_cpf,
    now()
  );

  -- Update tickets to paid status and set unit_price
  UPDATE tickets 
  SET 
    status = 'paid',
    transaction_id = v_transaction_id,
    reserved_until = NULL,
    unit_price = v_unit_price,
    updated_at = now()
  WHERE reservation_id = p_reservation_id 
    AND status = 'reserved';

  -- Update payments_pending status
  UPDATE payments_pending 
  SET 
    status = 'PAID',
    updated_at = now()
  WHERE reservation_id = p_reservation_id;

  -- Log the purchase
  INSERT INTO audit_logs (user_id, action, context)
  VALUES (
    v_reservation.buyer_user_id,
    'purchase_finalized',
    jsonb_build_object(
      'transaction_id', v_transaction_id,
      'raffle_id', v_reservation.raffle_id,
      'amount', v_total_amount,
      'ticket_count', v_qty,
      'provider_payment_id', p_asaas_payment_id
    )
  );

  RETURN jsonb_build_object(
    'success', true,
    'transaction_id', v_transaction_id,
    'raffle_id', v_reservation.raffle_id,
    'amount', v_total_amount,
    'ticket_count', v_qty,
    'numbers', v_ticket_numbers
  );
END;
$function$;