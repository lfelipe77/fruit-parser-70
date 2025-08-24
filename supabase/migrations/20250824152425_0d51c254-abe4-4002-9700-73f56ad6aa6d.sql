-- Prompt 1 — SQL migration to patch mark_tickets_paid
create or replace function public.mark_tickets_paid(
  p_reservation_id uuid,
  p_provider text,
  p_provider_payment_id text
)
returns void
language plpgsql
security definer
set search_path to 'public','pg_temp'
as $$
declare
  v_raffle uuid;
  v_uid uuid;
  v_amount numeric;
begin
  select min(t.raffle_id), min(t.buyer_user_id), count(*)::int * max(r.ticket_price)
    into v_raffle, v_uid, v_amount
  from public.tickets t
  join public.raffles r on r.id = t.raffle_id
  where t.reservation_id = p_reservation_id
    and t.status in ('reserved','paid');

  -- reserved -> paid
  update public.tickets
     set status = 'paid', is_paid = true, reserved_until = null
   where reservation_id = p_reservation_id
     and status = 'reserved';

  -- ledger (idempotent by unique (provider, provider_payment_id))
  insert into public.transactions(
    id, created_at, raffle_id, user_id, amount, currency,
    provider, provider_payment_id, status, reservation_id
  )
  select
    gen_random_uuid(), now(), v_raffle, v_uid, coalesce(v_amount,0), 'BRL',
    p_provider, p_provider_payment_id, 'paid', p_reservation_id
  where p_provider_payment_id is not null
  on conflict (provider, provider_payment_id) do nothing;

  -- keep existing behavior
  perform public.maybe_close_raffle(v_raffle);
end
$$;