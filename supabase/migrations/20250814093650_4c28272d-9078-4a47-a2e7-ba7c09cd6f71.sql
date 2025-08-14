-- Fix RLS policy to allow user profile creation during signup
-- The current policy blocks profile creation because auth.uid() might not be set during trigger execution

-- Drop the restrictive INSERT policy
DROP POLICY IF EXISTS "profiles_service_insert" ON public.user_profiles;

-- Create a new policy that allows profile creation for new users
-- This policy allows INSERT when either:
-- 1. The user is inserting their own profile (auth.uid() = id), OR
-- 2. This is during signup process (executed by service role/trigger)
CREATE POLICY "profiles_allow_signup_insert" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (
  -- Allow if user is inserting their own profile
  auth.uid() = id 
  OR 
  -- Allow if this is a service-level operation (during signup trigger)
  auth.uid() IS NULL
  OR
  -- Allow if the role being set is 'usuario' (default role for new users)
  role = 'usuario'
);

-- Also ensure the function has proper permissions
-- Update the handle_new_user function to use SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
begin
  insert into public.user_profiles (id, role, banned, created_at, updated_at)
  values (new.id, 'usuario', false, now(), now())
  on conflict (id) do nothing;
  return new;
end;
$$;