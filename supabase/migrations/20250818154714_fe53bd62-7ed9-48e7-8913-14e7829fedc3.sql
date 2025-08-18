-- Update record_mock_purchase_admin to set type='purchase' and provider_payment_id=null
CREATE OR REPLACE FUNCTION public.record_mock_purchase_admin(
  p_buyer_user_id uuid,
  p_raffle_id uuid,
  p_qty integer,
  p_unit_price numeric,
  p_numbers jsonb,
  p_provider_ref text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_tx_id  uuid;
  v_amount numeric := p_qty * p_unit_price;
  v_status text    := 'paid';
BEGIN
  INSERT INTO public.transactions (
    raffle_id, buyer_user_id, user_id, amount, status, type, provider, provider_ref, provider_payment_id
  )
  VALUES (
    p_raffle_id, p_buyer_user_id, p_buyer_user_id, v_amount, v_status, 'purchase', 'mock', p_provider_ref, NULL
  )
  ON CONFLICT (provider_ref) DO UPDATE
    SET created_at = transactions.created_at
  RETURNING id INTO v_tx_id;

  IF NOT EXISTS (SELECT 1 FROM public.tickets WHERE transaction_id = v_tx_id) THEN
    INSERT INTO public.tickets (
      raffle_id, buyer_user_id, qty, unit_price, numbers, transaction_id, status
    )
    VALUES (
      p_raffle_id, p_buyer_user_id, p_qty, p_unit_price, p_numbers, v_tx_id, 'issued'
    );
  END IF;

  RETURN v_tx_id;
END
$function$;