-- A) Purchase summary and preview RPCs
create or replace function public.purchase_summary_by_reservation(p_reservation_id uuid)
returns table (
  transaction_id uuid,
  reservation_id uuid,
  raffle_id uuid,
  buyer_user_id uuid,
  provider text,
  provider_payment_id text,
  amount numeric,
  status text,
  created_at timestamptz,
  numbers jsonb,
  qty bigint
)
language sql stable security definer
set search_path = 'public'
as $$
  select 
    tr.id as transaction_id,
    tr.reservation_id,
    tr.raffle_id,
    tr.buyer_user_id,
    tr.provider,
    tr.provider_payment_id,
    tr.amount,
    tr.status,
    tr.created_at,
    jsonb_agg(t.ticket_number order by t.ticket_number) as numbers,
    count(t.id) as qty
  from public.transactions tr
  join public.tickets t on t.transaction_id = tr.id
  where tr.reservation_id = p_reservation_id
    and tr.status = 'paid'
  group by tr.id, tr.reservation_id, tr.raffle_id, tr.buyer_user_id, tr.provider, tr.provider_payment_id, tr.amount, tr.status, tr.created_at
  order by tr.created_at desc
  limit 1;
$$;

create or replace function public.purchase_preview_by_reservation(p_reservation_id uuid)
returns table (
  reservation_id uuid,
  raffle_id uuid,
  buyer_user_id uuid,
  numbers jsonb,
  qty bigint,
  total_amount numeric,
  status text
)
language sql stable security definer
set search_path = 'public'
as $$
  select 
    t.reservation_id,
    t.raffle_id,
    t.user_id as buyer_user_id,
    jsonb_agg(t.ticket_number order by t.ticket_number) as numbers,
    count(t.id) as qty,
    sum(t.unit_price) as total_amount,
    t.status
  from public.tickets t
  where t.reservation_id = p_reservation_id
  group by t.reservation_id, t.raffle_id, t.user_id, t.status
  limit 1;
$$;

-- B) Winner search RPCs
create or replace function public.raffle_tickets_paid(p_raffle_id uuid)
returns table (
  ticket_id uuid,
  ticket_number bigint,
  user_id uuid,
  reservation_id uuid,
  transaction_id uuid,
  purchased_at timestamptz
)
language sql stable security definer
set search_path = 'public'
as $$
  select
    t.id, t.ticket_number, t.user_id, t.reservation_id, t.transaction_id, t.updated_at
  from public.tickets t
  where t.raffle_id = p_raffle_id
    and t.status = 'paid'
  order by t.ticket_number;
$$;

create or replace function public.raffle_ticket_counts(p_raffle_id uuid)
returns table(status text, qty bigint)
language sql stable security definer
set search_path = 'public'
as $$
  select t.status, count(*)::bigint
  from public.tickets t
  where t.raffle_id = p_raffle_id
  group by t.status
  order by t.status;
$$;

create or replace function public.find_ticket_by_number(p_raffle_id uuid, p_ticket_number bigint)
returns table (
  ticket_id uuid,
  user_id uuid,
  reservation_id uuid,
  transaction_id uuid,
  status text,
  purchased_at timestamptz
)
language sql stable security definer
set search_path = 'public'
as $$
  select
    t.id, t.user_id, t.reservation_id, t.transaction_id, t.status, t.updated_at
  from public.tickets t
  where t.raffle_id = p_raffle_id
    and t.ticket_number = p_ticket_number
  limit 1;
$$;

-- C) Performance indexes
create index if not exists idx_tickets_raffle_status_number on public.tickets(raffle_id, status, ticket_number);
create index if not exists idx_tickets_reservation on public.tickets(reservation_id);
create index if not exists idx_transactions_reservation on public.transactions(reservation_id) where reservation_id is not null;