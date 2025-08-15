-- AUDIT TABLE (idempotent)
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id uuid,
  action text not null,
  payload jsonb
);

alter table public.audit_logs enable row level security;

drop policy if exists "audit_select_admin" on public.audit_logs;
create policy "audit_select_admin"
on public.audit_logs for select to authenticated
using (exists (select 1 from public.user_profiles p where p.id = auth.uid() and p.is_admin));

drop policy if exists "audit_insert_any_auth" on public.audit_logs;
create policy "audit_insert_any_auth"
on public.audit_logs for insert to authenticated
with check (true);

-- RPC: log_user_action(user_id, action, payload)
create or replace function public.log_user_action(
  p_user_id uuid,
  p_action text,
  p_payload json
) returns void
language plpgsql security definer as $$
begin
  insert into public.audit_logs(user_id, action, payload)
  values (p_user_id, coalesce(p_action,'(none)'), p_payload::jsonb);
end$$;
alter function public.log_user_action(uuid,text,json) set search_path = public, pg_temp;
grant execute on function public.log_user_action(uuid,text,json) to authenticated;