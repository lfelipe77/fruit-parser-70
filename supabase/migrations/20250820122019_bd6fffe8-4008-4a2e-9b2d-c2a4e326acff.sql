-- Create the record_purchase_v2 RPC function that captures customer data
CREATE OR REPLACE FUNCTION public.record_purchase_v2(
  p_buyer_user_id uuid,
  p_raffle_id uuid,
  p_qty integer,
  p_unit_price numeric,
  p_numbers text[],
  p_provider_ref text,
  p_customer_name text,
  p_customer_phone text,
  p_customer_cpf text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
declare
  v_tx_id uuid := gen_random_uuid();
begin
  if auth.uid() is null or auth.uid() <> p_buyer_user_id then
    raise exception 'buyer_user_id mismatch';
  end if;

  insert into public.transactions (
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
  )
  values (
    v_tx_id,
    p_raffle_id,
    p_buyer_user_id,
    p_buyer_user_id,
    p_qty * p_unit_price,
    'paid',
    'mock',
    p_provider_ref,
    coalesce(to_jsonb(p_numbers), '[]'::jsonb),
    p_customer_name,
    p_customer_phone,
    p_customer_cpf,
    now()
  );

  return v_tx_id;
end;
$function$