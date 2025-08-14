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

-- Add new columns to existing raffles table (without foreign key first)
alter table public.raffles add column if not exists updated_at timestamptz not null default now();
alter table public.raffles add column if not exists owner_user_id uuid;
alter table public.raffles add column if not exists slug text unique;
alter table public.raffles add column if not exists category_id bigint;
alter table public.raffles add column if not exists prize_value numeric(12,2);
alter table public.raffles add column if not exists draw_date timestamptz;
alter table public.raffles add column if not exists winner_user_id uuid;
alter table public.raffles add column if not exists draw_timestamp timestamptz;

-- Safely update owner_user_id for existing raffles (only where user exists in user_profiles)
update public.raffles 
set owner_user_id = user_id 
where owner_user_id is null 
  and user_id in (select id from public.user_profiles);

-- Add foreign key constraints after data is clean
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints 
    where constraint_name = 'raffles_owner_user_id_fkey'
  ) then
    alter table public.raffles 
    add constraint raffles_owner_user_id_fkey 
    foreign key (owner_user_id) references public.user_profiles(id) on delete cascade;
  end if;

  if not exists (
    select 1 from information_schema.table_constraints 
    where constraint_name = 'raffles_category_id_fkey'
  ) then
    alter table public.raffles 
    add constraint raffles_category_id_fkey 
    foreign key (category_id) references public.categories(id) on delete set null;
  end if;

  if not exists (
    select 1 from information_schema.table_constraints 
    where constraint_name = 'raffles_winner_user_id_fkey'
  ) then
    alter table public.raffles 
    add constraint raffles_winner_user_id_fkey 
    foreign key (winner_user_id) references public.user_profiles(id) on delete set null;
  end if;
end $$;

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

-- Add unique constraint on raffle_id, number (only if it doesn't exist)
do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints 
    where constraint_name = 'ux_tickets_raffle_number'
  ) then
    create unique index ux_tickets_raffle_number on public.tickets(raffle_id, number);
  end if;
end $$;

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