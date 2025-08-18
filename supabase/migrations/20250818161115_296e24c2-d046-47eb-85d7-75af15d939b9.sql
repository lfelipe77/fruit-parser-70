-- SINGLE, UNAMBIGUOUS RPC SIGNATURE
-- record_mock_purchase_admin(uuid, uuid, integer, numeric, jsonb, text) -> uuid

create or replace function public.record_mock_purchase_admin(
  p_buyer_user_id uuid,
  p_raffle_id uuid,
  p_qty integer,
  p_unit_price numeric,
  p_numbers jsonb,
  p_provider_ref text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_tx_id  uuid;
  v_amount numeric := p_qty * p_unit_price;
begin
  insert into public.transactions (
    raffle_id, buyer_user_id, user_id,
    amount, status, type, provider, provider_ref, provider_payment_id
  )
  values (
    p_raffle_id, p_buyer_user_id, p_buyer_user_id,
    v_amount, 'paid', 'charge', 'mock', p_provider_ref, null
  )
  on conflict (provider_ref) do update
    set created_at = public.transactions.created_at
  returning id into v_tx_id;

  if not exists (select 1 from public.tickets where transaction_id = v_tx_id) then
    insert into public.tickets (
      raffle_id, buyer_user_id, qty, unit_price, numbers, transaction_id, status
    )
    values (
      p_raffle_id, p_buyer_user_id, p_qty, p_unit_price, p_numbers, v_tx_id, 'issued'
    );
  end if;

  return v_tx_id;
end$$;

grant execute on function public.record_mock_purchase_admin(uuid,uuid,integer,numeric,jsonb,text) to authenticated;

-- (Optional) remove any confusing old overloads (ignore "does not exist" errors)
drop function if exists public.record_mock_purchase_admin(uuid,uuid,integer,numeric,json,text);
drop function if exists public.record_mock_purchase_admin(uuid,uuid,integer,numeric,text,text);