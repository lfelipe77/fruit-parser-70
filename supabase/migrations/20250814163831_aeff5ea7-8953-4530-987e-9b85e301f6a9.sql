-- Fix function search path security issue
-- RPCs (SECURITY DEFINER + search_path seguro)
create or replace function public.create_raffle(
  p_title text,
  p_description text,
  p_category_id bigint,
  p_image_url text,
  p_prize_value numeric,
  p_total_tickets int,
  p_ticket_price numeric,
  p_draw_date timestamptz
) returns uuid
language plpgsql security definer as $$
declare v_id uuid;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  insert into public.raffles(
    user_id, owner_user_id, title, description, category_id, image_url,
    prize_value, total_tickets, ticket_price, draw_date, status
  ) values (
    auth.uid(), auth.uid(), p_title, p_description, p_category_id, p_image_url,
    p_prize_value, p_total_tickets, p_ticket_price, p_draw_date, 'pending'
  )
  returning id into v_id;

  return v_id;
end$$;
alter function public.create_raffle(
  text, text, bigint, text, numeric, int, numeric, timestamptz
) set search_path = public, pg_temp;
grant execute on function public.create_raffle(
  text, text, bigint, text, numeric, int, numeric, timestamptz
) to authenticated;

create or replace function public.reserve_tickets(
  p_raffle_id uuid,
  p_qty int
) returns int[] language plpgsql security definer as $$
declare
  v_numbers int[] := '{}';
  v_max int;
  v_taken int;
  v_next int := 1;
begin
  if auth.uid() is null then
    raise exception 'not authenticated';
  end if;

  select total_tickets into v_max from public.raffles where id = p_raffle_id;
  if v_max is null then
    raise exception 'raffle not found';
  end if;

  while array_length(v_numbers,1) is null or array_length(v_numbers,1) < p_qty loop
    if v_next > v_max then exit; end if;

    select count(*) into v_taken from public.tickets
    where raffle_id = p_raffle_id
      and number = v_next
      and (is_paid = true or payment_status = 'pending');

    if v_taken = 0 then
      insert into public.tickets(raffle_id, user_id, number, payment_status)
      values (p_raffle_id, auth.uid(), v_next, 'pending');
      v_numbers := v_numbers || v_next;
    end if;

    v_next := v_next + 1;
  end loop;

  if array_length(v_numbers,1) is null then
    raise exception 'no tickets available';
  end if;

  return v_numbers;
end$$;
alter function public.reserve_tickets(uuid,int) set search_path = public, pg_temp;
grant execute on function public.reserve_tickets(uuid,int) to authenticated;

create or replace function public.confirm_payment(
  p_provider payment_provider,
  p_provider_payment_id text
) returns void
language plpgsql security definer as $$
declare
  v_tx public.transactions_raffle%rowtype;
begin
  select * into v_tx
  from public.transactions_raffle
  where provider = p_provider and provider_payment_id = p_provider_payment_id
  limit 1;

  if not found then
    raise exception 'transaction not found';
  end if;

  update public.transactions_raffle
    set status = 'paid'
  where id = v_tx.id;

  update public.tickets
    set is_paid = true, payment_status = 'paid'
  where raffle_id = v_tx.raffle_id
    and user_id = v_tx.user_id
    and payment_status = 'pending';
end$$;
alter function public.confirm_payment(payment_provider,text) set search_path = public, pg_temp;
revoke all on function public.confirm_payment(payment_provider,text) from public;
grant execute on function public.confirm_payment(payment_provider,text) to service_role;

create or replace function public.select_winner(p_raffle_id uuid)
returns uuid language plpgsql security definer as $$
declare
  v_winner_user uuid;
begin
  if not exists (
    select 1 from public.user_profiles p where p.id = auth.uid() and p.role = 'admin'
  ) then
    raise exception 'admin only';
  end if;

  select t.user_id into v_winner_user
  from public.tickets t
  where t.raffle_id = p_raffle_id and t.is_paid = true
  order by random() limit 1;

  if v_winner_user is null then
    raise exception 'no paid tickets';
  end if;

  update public.raffles
  set winner_user_id = v_winner_user, draw_timestamp = now(), status = 'completed'
  where id = p_raffle_id;

  return v_winner_user;
end$$;
alter function public.select_winner(uuid) set search_path = public, pg_temp;
grant execute on function public.select_winner(uuid) to authenticated;

-- VIEWS (públicas) - recreate with better structure
create or replace view public.v_raffle_ticket_stats as
select
  r.id as raffle_id,
  count(t.*) filter (where t.is_paid = true) as paid_tickets,
  r.total_tickets - count(t.*) filter (where t.is_paid = true) as tickets_remaining
from public.raffles r
left join public.tickets t on t.raffle_id = r.id
group by r.id;

create or replace view public.raffles_public as
select
  r.*,
  coalesce(s.paid_tickets,0) as paid_tickets,
  coalesce(s.tickets_remaining, r.total_tickets) as tickets_remaining
from public.raffles r
left join public.v_raffle_ticket_stats s on s.raffle_id = r.id
where r.status in ('active','completed');

grant select on public.raffles_public to anon, authenticated;
grant select on public.v_raffle_ticket_stats to anon, authenticated;