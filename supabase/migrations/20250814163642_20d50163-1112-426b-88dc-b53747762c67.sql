-- EXTENSIONS
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;
create extension if not exists citext;

-- ENUMS
do $$ begin
  create type payment_provider as enum ('asaas','stripe');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('pending','paid','failed','refunded','canceled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type ticket_status as enum ('reserved','paid','canceled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type raffle_status as enum ('draft','under_review','approved','rejected','closed','delivered');
exception when duplicate_object then null; end $$;

-- Add missing columns to existing user_profiles if needed
alter table public.user_profiles add column if not exists display_name text;
alter table public.user_profiles add column if not exists username citext unique;

-- Create touch_updated_at function
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

-- CATEGORIES (new table)
create table if not exists public.categories (
  id bigserial primary key,
  created_at timestamptz not null default now(),
  nome text not null,
  slug text not null unique,
  icone_url text,
  descricao text,
  destaque boolean not null default false
);

alter table public.categories enable row level security;

drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public"
on public.categories for select to public using (true);

drop policy if exists "categories_admin_insert" on public.categories;
create policy "categories_admin_insert"
on public.categories for insert
to authenticated with check (exists (
  select 1 from public.user_profiles p where p.id = auth.uid() and p.role = 'admin'
));

drop policy if exists "categories_admin_update" on public.categories;
create policy "categories_admin_update"
on public.categories for update
to authenticated using (exists (
  select 1 from public.user_profiles p where p.id = auth.uid() and p.role = 'admin'
))
with check (exists (
  select 1 from public.user_profiles p where p.id = auth.uid() and p.role = 'admin'
));

drop policy if exists "categories_admin_delete" on public.categories;
create policy "categories_admin_delete"
on public.categories for delete
to authenticated using (exists (
  select 1 from public.user_profiles p where p.id = auth.uid() and p.role = 'admin'
));

create index if not exists idx_categories_slug on public.categories(slug);

-- Update existing raffles table with new columns
alter table public.raffles add column if not exists updated_at timestamptz not null default now();
alter table public.raffles add column if not exists owner_user_id uuid references public.user_profiles(id) on delete cascade;
alter table public.raffles add column if not exists slug text unique;
alter table public.raffles add column if not exists category_id bigint references public.categories(id) on delete set null;
alter table public.raffles add column if not exists prize_value numeric(12,2);
alter table public.raffles add column if not exists draw_date timestamptz;
alter table public.raffles add column if not exists winner_user_id uuid references public.user_profiles(id) on delete set null;
alter table public.raffles add column if not exists draw_timestamp timestamptz;

-- Update owner_user_id to match user_id for existing raffles
update public.raffles set owner_user_id = user_id where owner_user_id is null;

-- Add trigger to raffles
drop trigger if exists trg_raffles_updated on public.raffles;
create trigger trg_raffles_updated
before update on public.raffles
for each row execute function public.touch_updated_at();

create index if not exists idx_raffles_owner on public.raffles(owner_user_id);
create index if not exists idx_raffles_category on public.raffles(category_id);
create index if not exists idx_raffles_draw_date on public.raffles(draw_date);
create index if not exists idx_raffles_slug on public.raffles(slug);

-- Update RLS policies for raffles to use new schema and status
drop policy if exists "raffles_select_public_filtered" on public.raffles;
create policy "raffles_select_public_filtered"
on public.raffles for select to public using (
  status in ('active','completed')
  or owner_user_id = auth.uid() 
  or user_id = auth.uid()
  or exists (select 1 from public.user_profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Update tickets table
alter table public.tickets add column if not exists number int;
alter table public.tickets add column if not exists status ticket_status not null default 'reserved';
alter table public.tickets add column if not exists transaction_id uuid;

-- Update ticket numbers for existing tickets
update public.tickets 
set number = coalesce(ticket_number, 1) 
where number is null;

-- Add unique constraint on raffle_id, number
create unique index if not exists ux_tickets_raffle_number on public.tickets(raffle_id, number);

create index if not exists idx_tickets_tx on public.tickets(transaction_id);
create index if not exists idx_tickets_status on public.tickets(status);

-- TRANSACTIONS (new table for payments)
create table if not exists public.transactions_raffle (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  raffle_id uuid not null references public.raffles(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  currency char(3) not null default 'BRL',
  provider payment_provider not null,
  provider_payment_id text not null,
  status payment_status not null default 'pending',
  raw_payload jsonb
);

create index if not exists idx_tx_raffle_user on public.transactions_raffle(user_id);
create index if not exists idx_tx_raffle_raffle on public.transactions_raffle(raffle_id);
create index if not exists idx_tx_raffle_provider_id on public.transactions_raffle(provider, provider_payment_id);
create index if not exists idx_tx_raffle_status on public.transactions_raffle(status);
create unique index if not exists ux_tx_raffle_provider_pid on public.transactions_raffle(provider, provider_payment_id);

alter table public.transactions_raffle enable row level security;

drop policy if exists "tx_raffle_select_own_or_admin" on public.transactions_raffle;
create policy "tx_raffle_select_own_or_admin"
on public.transactions_raffle for select to authenticated
using (user_id = auth.uid()
  or exists (select 1 from public.user_profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "tx_raffle_insert_user" on public.transactions_raffle;
create policy "tx_raffle_insert_user"
on public.transactions_raffle for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "tx_raffle_update_admin" on public.transactions_raffle;
create policy "tx_raffle_update_admin"
on public.transactions_raffle for update to authenticated
using (exists (select 1 from public.user_profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (true);

-- VIEWS (públicas)
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

-- Insert sample categories
insert into public.categories (nome, slug, icone_url, destaque) values
('Eletrônicos', 'eletronicos', null, true),
('Veículos', 'veiculos', null, true),
('Casa e Decoração', 'casa-decoracao', null, true),
('Dinheiro', 'dinheiro', null, true)
on conflict (slug) do nothing;

-- STORAGE: bucket + policies
do $$
begin
  if not exists (select 1 from storage.buckets where id = 'raffle-images') then
    insert into storage.buckets (id, name, public) values ('raffle-images','raffle-images', true);
  end if;
exception when others then
  null;
end $$;

drop policy if exists "Public read raffle-images" on storage.objects;
create policy "Public read raffle-images"
on storage.objects for select
to public using (bucket_id = 'raffle-images');

drop policy if exists "Users can upload to raffle-images" on storage.objects;
create policy "Users can upload to raffle-images"
on storage.objects for insert to authenticated
with check (
  bucket_id = 'raffle-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "Users manage own raffle-images" on storage.objects;
create policy "Users manage own raffle-images"
on storage.objects for update using (
  bucket_id = 'raffle-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'raffle-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);