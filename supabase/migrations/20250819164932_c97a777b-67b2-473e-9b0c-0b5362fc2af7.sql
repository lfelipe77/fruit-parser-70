-- Update RPC function to be security definer and proper
create or replace function public.record_mock_purchase_admin(
  p_buyer_user_id uuid,
  p_raffle_id uuid,
  p_qty integer,
  p_unit_price numeric,
  p_numbers text[],
  p_provider_ref text
) returns uuid
language plpgsql
security definer                       -- Important for RLS immunity
set search_path = public               -- Avoid schema confusion
as $$
declare
  v_tx_id uuid := gen_random_uuid();
begin
  insert into public.transactions (
    id, raffle_id, buyer_user_id, amount, status, provider, provider_payment_id, numbers, created_at
  )
  values (
    v_tx_id, p_raffle_id, p_buyer_user_id, p_qty * p_unit_price, 'paid', 'mock', p_provider_ref, to_jsonb(p_numbers), now()
  );

  return v_tx_id;
end;
$$;

-- Grant execute permission
grant execute on function public.record_mock_purchase_admin(uuid,uuid,integer,numeric,text[],text) to authenticated;

-- Enable RLS on transactions if not already enabled
alter table public.transactions enable row level security;

-- Create policy for buyers to read their own transactions
create policy if not exists "tx_read_own"
on public.transactions
for select
to authenticated
using (buyer_user_id = auth.uid());