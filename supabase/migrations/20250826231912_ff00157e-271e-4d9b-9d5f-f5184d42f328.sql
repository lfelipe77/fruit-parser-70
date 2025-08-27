-- Create RPC function to finalize purchase after payment confirmation
CREATE OR REPLACE FUNCTION public.finalize_paid_purchase(
  p_reservation_id UUID,
  p_asaas_payment_id TEXT,
  p_customer_name TEXT DEFAULT NULL,
  p_customer_phone TEXT DEFAULT NULL,
  p_customer_cpf TEXT DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_reservation RECORD;
  v_raffle RECORD;
  v_ticket_numbers TEXT[];
  v_transaction_id UUID;
  v_total_amount NUMERIC;
  v_qty INTEGER;
BEGIN
  -- Get reservation details with tickets
  SELECT 
    COUNT(*) as ticket_count,
    r.raffle_id,
    r.user_id as buyer_user_id,
    r.unit_price,
    SUM(r.unit_price) as total_amount,
    ARRAY_AGG(COALESCE(r.ticket_number, '')) as numbers
  INTO v_reservation
  FROM tickets r
  WHERE r.reservation_id = p_reservation_id 
    AND r.status = 'reserved'
    AND r.reserved_until > now()
  GROUP BY r.raffle_id, r.user_id, r.unit_price;

  IF NOT FOUND OR v_reservation.ticket_count = 0 THEN
    RETURN jsonb_build_object('error', 'No valid reserved tickets found for reservation');
  END IF;

  -- Get raffle details
  SELECT * INTO v_raffle FROM raffles WHERE id = v_reservation.raffle_id;
  IF NOT FOUND THEN
    RETURN jsonb_build_object('error', 'Raffle not found');
  END IF;

  v_qty := v_reservation.ticket_count;
  v_total_amount := v_reservation.total_amount;
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

  -- Update tickets to paid status
  UPDATE tickets 
  SET 
    status = 'paid',
    transaction_id = v_transaction_id,
    reserved_until = NULL,
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
$$;