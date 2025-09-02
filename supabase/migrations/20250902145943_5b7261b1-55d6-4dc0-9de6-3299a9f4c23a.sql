-- Ensure public avatars bucket and correct RLS for profile and storage

-- 1) Ensure avatars bucket exists and is public
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = excluded.public;

-- 2) Storage policies for avatars bucket
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Public read avatars'
  ) then
    create policy "Public read avatars"
    on storage.objects for select
    using (bucket_id = 'avatars');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can upload their own avatars'
  ) then
    create policy "Users can upload their own avatars"
    on storage.objects for insert to authenticated
    with check (
      bucket_id = 'avatars' and
      auth.uid()::text = (storage.foldername(name))[1]
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can update their own avatars'
  ) then
    create policy "Users can update their own avatars"
    on storage.objects for update to authenticated
    using (
      bucket_id = 'avatars' and
      auth.uid()::text = (storage.foldername(name))[1]
    )
    with check (
      bucket_id = 'avatars' and
      auth.uid()::text = (storage.foldername(name))[1]
    );
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage' and tablename = 'objects' and policyname = 'Users can delete their own avatars'
  ) then
    create policy "Users can delete their own avatars"
    on storage.objects for delete to authenticated
    using (
      bucket_id = 'avatars' and
      auth.uid()::text = (storage.foldername(name))[1]
    );
  end if;
end $$;

-- 3) RLS for user_profiles to allow owner update/insert/select
alter table if exists public.user_profiles enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='user_profiles' and policyname='Users can view their own profile'
  ) then
    create policy "Users can view their own profile"
    on public.user_profiles
    for select to authenticated
    using (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='user_profiles' and policyname='Users can insert their own profile'
  ) then
    create policy "Users can insert their own profile"
    on public.user_profiles
    for insert to authenticated
    with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='user_profiles' and policyname='Users can update their own profile'
  ) then
    create policy "Users can update their own profile"
    on public.user_profiles
    for update to authenticated
    using (auth.uid() = id)
    with check (auth.uid() = id);
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname='public' and tablename='user_profiles' and policyname='Admins can manage all profiles'
  ) then
    create policy "Admins can manage all profiles"
    on public.user_profiles
    for all to authenticated
    using (public.is_admin(auth.uid()))
    with check (public.is_admin(auth.uid()));
  end if;
end $$;

-- 4) updated_at trigger on user_profiles (uses existing public.set_updated_at)
create trigger trg_user_profiles_updated_at
before update on public.user_profiles
for each row execute function public.set_updated_at();