-- Complete Raffle System Schema (Fixed)
create extension if not exists "uuid-ossp";
create extension if not exists pgcrypto;

-- Create custom types
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

-- Update user_profiles table
ALTER TABLE public.user_profiles 
ADD COLUMN IF NOT EXISTS display_name text,
ADD COLUMN IF NOT EXISTS username citext,
ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false;

-- Create unique constraint on username if it doesn't exist
DO $$ 
BEGIN
    ALTER TABLE public.user_profiles ADD CONSTRAINT user_profiles_username_key UNIQUE (username);
EXCEPTION
    WHEN duplicate_table THEN NULL;
    WHEN duplicate_object THEN NULL;
END $$;

-- Create updated_at trigger function
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end$$;

-- Add trigger to user_profiles
drop trigger if exists trg_user_profiles_updated on public.user_profiles;
create trigger trg_user_profiles_updated
before update on public.user_profiles
for each row execute function public.touch_updated_at();

-- Create categories table
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

-- Categories policies
drop policy if exists "categories_select_public" on public.categories;
create policy "categories_select_public"
on public.categories for select to public using (true);

drop policy if exists "categories_admin_write_insert" on public.categories;
create policy "categories_admin_write_insert"
on public.categories for insert
to authenticated 
with check (exists (
  select 1 from public.user_profiles p where p.id = auth.uid() and p.is_admin
));

drop policy if exists "categories_admin_write_update" on public.categories;
create policy "categories_admin_write_update"
on public.categories for update
to authenticated 
using (exists (
  select 1 from public.user_profiles p where p.id = auth.uid() and p.is_admin
))
with check (exists (
  select 1 from public.user_profiles p where p.id = auth.uid() and p.is_admin
));

drop policy if exists "categories_admin_write_delete" on public.categories;
create policy "categories_admin_write_delete"
on public.categories for delete
to authenticated 
using (exists (
  select 1 from public.user_profiles p where p.id = auth.uid() and p.is_admin
));

create index if not exists idx_categories_slug on public.categories(slug);

-- Create raffles table
create table if not exists public.raffles (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  owner_user_id uuid not null references public.user_profiles(id) on delete cascade,
  title text not null,
  slug text unique,
  description text,
  category_id bigint references public.categories(id) on delete set null,
  image_url text,
  prize_value numeric(12,2),
  total_tickets int not null check (total_tickets > 0),
  ticket_price numeric(12,2) not null check (ticket_price >= 0),
  draw_date timestamptz,
  status raffle_status not null default 'draft',
  winner_user_id uuid references public.user_profiles(id) on delete set null,
  draw_timestamp timestamptz
);

drop trigger if exists trg_raffles_updated on public.raffles;
create trigger trg_raffles_updated
before update on public.raffles
for each row execute function public.touch_updated_at();

-- Raffles indexes
create index if not exists idx_raffles_owner on public.raffles(owner_user_id);
create index if not exists idx_raffles_category on public.raffles(category_id);
create index if not exists idx_raffles_status on public.raffles(status);
create index if not exists idx_raffles_draw_date on public.raffles(draw_date);
create index if not exists idx_raffles_slug on public.raffles(slug);

alter table public.raffles enable row level security;

-- Raffles policies
drop policy if exists "raffles_select_public_filtered" on public.raffles;
create policy "raffles_select_public_filtered"
on public.raffles for select to public using (
  status in ('approved','closed','delivered')
  or owner_user_id = auth.uid()
  or exists (select 1 from public.user_profiles p where p.id = auth.uid() and p.is_admin)
);

drop policy if exists "raffles_insert_owner" on public.raffles;
create policy "raffles_insert_owner"
on public.raffles for insert to authenticated
with check (owner_user_id = auth.uid());

drop policy if exists "raffles_update_owner" on public.raffles;
create policy "raffles_update_owner"
on public.raffles for update to authenticated
using (
  owner_user_id = auth.uid()
  and status in ('draft','under_review')
)
with check (owner_user_id = auth.uid());

drop policy if exists "raffles_admin_update" on public.raffles;
create policy "raffles_admin_update"
on public.raffles for update to authenticated
using (exists (select 1 from public.user_profiles p where p.id = auth.uid() and p.is_admin))
with check (true);

-- Create transactions table
create table if not exists public.transactions (
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

-- Transactions indexes
create index if not exists idx_tx_user on public.transactions(user_id);
create index if not exists idx_tx_raffle on public.transactions(raffle_id);
create index if not exists idx_tx_provider_id on public.transactions(provider, provider_payment_id);
create index if not exists idx_tx_status on public.transactions(status);

alter table public.transactions enable row level security;

-- Transactions policies
drop policy if exists "tx_select_own_or_admin" on public.transactions;
create policy "tx_select_own_or_admin"
on public.transactions for select to authenticated
using (user_id = auth.uid()
  or exists (select 1 from public.user_profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "tx_insert_user" on public.transactions;
create policy "tx_insert_user"
on public.transactions for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "tx_update_admin_or_service" on public.transactions;
create policy "tx_update_admin_or_service"
on public.transactions for update to authenticated
using (exists (select 1 from public.user_profiles p where p.id = auth.uid() and p.is_admin))
with check (true);

-- Create tickets table
create table if not exists public.tickets (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  raffle_id uuid not null references public.raffles(id) on delete cascade,
  user_id uuid not null references public.user_profiles(id) on delete cascade,
  number int not null,
  status ticket_status not null default 'reserved',
  transaction_id uuid references public.transactions(id) on delete set null,
  unique (raffle_id, number)
);

-- Tickets indexes
create index if not exists idx_tickets_raffle on public.tickets(raffle_id);
create index if not exists idx_tickets_user on public.tickets(user_id);
create index if not exists idx_tickets_tx on public.tickets(transaction_id);
create index if not exists idx_tickets_status on public.tickets(status);

alter table public.tickets enable row level security;

-- Tickets policies
drop policy if exists "tickets_select_own_or_admin" on public.tickets;
create policy "tickets_select_own_or_admin"
on public.tickets for select to authenticated
using (user_id = auth.uid()
  or exists (select 1 from public.user_profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "tickets_insert_own" on public.tickets;
create policy "tickets_insert_own"
on public.tickets for insert to authenticated
with check (user_id = auth.uid());

drop policy if exists "tickets_update_admin" on public.tickets;
create policy "tickets_update_admin"
on public.tickets for update to authenticated
using (exists (select 1 from public.user_profiles p where p.id = auth.uid() and p.is_admin))
with check (true);

-- Create views
create or replace view public.v_raffle_ticket_stats as
select
  r.id as raffle_id,
  count(t.*) filter (where t.status = 'paid') as paid_tickets,
  r.total_tickets - count(t.*) filter (where t.status = 'paid') as tickets_remaining
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
where r.status in ('approved','closed','delivered');

grant select on public.raffles_public to anon, authenticated;
grant select on public.v_raffle_ticket_stats to anon, authenticated;

-- Create RPC functions
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
    owner_user_id, title, description, category_id, image_url,
    prize_value, total_tickets, ticket_price, draw_date, status
  ) values (
    auth.uid(), p_title, p_description, p_category_id, p_image_url,
    p_prize_value, p_total_tickets, p_ticket_price, p_draw_date, 'under_review'
  )
  returning id into v_id;

  return v_id;
end$$;

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
    if v_next > v_max then
      exit;
    end if;

    select count(*) into v_taken from public.tickets
      where raffle_id = p_raffle_id and number = v_next and status in ('reserved','paid');

    if v_taken = 0 then
      insert into public.tickets(raffle_id, user_id, number, status)
      values (p_raffle_id, auth.uid(), v_next, 'reserved');
      v_numbers := v_numbers || v_next;
    end if;

    v_next := v_next + 1;
  end loop;

  if array_length(v_numbers,1) is null then
    raise exception 'no tickets available';
  end if;

  return v_numbers;
end$$;

grant execute on function public.reserve_tickets(uuid,int) to authenticated;

create or replace function public.confirm_payment(
  p_provider payment_provider,
  p_provider_payment_id text
) returns void
language plpgsql security definer as $$
declare
  v_tx public.transactions%rowtype;
begin
  select * into v_tx
  from public.transactions
  where provider = p_provider and provider_payment_id = p_provider_payment_id
  limit 1;

  if not found then
    raise exception 'transaction not found';
  end if;

  update public.transactions
  set status = 'paid'
  where id = v_tx.id;

  update public.tickets
  set status = 'paid', transaction_id = v_tx.id
  where raffle_id = v_tx.raffle_id and user_id = v_tx.user_id and status = 'reserved';
end$$;

revoke all on function public.confirm_payment(payment_provider,text) from public;
grant execute on function public.confirm_payment(payment_provider,text) to service_role;

create or replace function public.select_winner(p_raffle_id uuid)
returns uuid language plpgsql security definer as $$
declare
  v_winner_user uuid;
begin
  if not exists (select 1 from public.user_profiles p where p.id = auth.uid() and p.is_admin) then
    raise exception 'admin only';
  end if;

  select t.user_id into v_winner_user
  from public.tickets t
  where t.raffle_id = p_raffle_id and t.status = 'paid'
  order by random() limit 1;

  if v_winner_user is null then
    raise exception 'no paid tickets';
  end if;

  update public.raffles
  set winner_user_id = v_winner_user, draw_timestamp = now(), status = 'closed'
  where id = p_raffle_id;

  return v_winner_user;
end$$;

grant execute on function public.select_winner(uuid) to authenticated;

-- Create storage bucket
insert into storage.buckets (id, name, public) values ('raffle-images','raffle-images', true)
on conflict (id) do nothing;

-- Storage policies
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
on storage.objects for update to authenticated
using (
  bucket_id = 'raffle-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'raffle-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Insert sample categories
INSERT INTO public.categories (nome, slug, icone_url, descricao, destaque) VALUES
('Eletrônicos', 'eletronicos', '📱', 'Smartphones, tablets, notebooks e mais', true),
('Casa & Jardim', 'casa-jardim', '🏠', 'Itens para casa, decoração e jardim', true),
('Automóveis', 'automoveis', '🚗', 'Carros, motos e acessórios', true),
('Dinheiro', 'dinheiro', '💰', 'Prêmios em dinheiro', true),
('Jogos', 'jogos', '🎮', 'Consoles, jogos e acessórios gamer', true)
ON CONFLICT (slug) DO NOTHING;