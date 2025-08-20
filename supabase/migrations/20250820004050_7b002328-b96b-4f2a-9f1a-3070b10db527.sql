-- backfill any nulls to empty array
update public.transactions
set numbers = '[]'::jsonb
where numbers is null;

-- enforce default + not null
alter table public.transactions
  alter column numbers set default '[]'::jsonb,
  alter column numbers set not null;