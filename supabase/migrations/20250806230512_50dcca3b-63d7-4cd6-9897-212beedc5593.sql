-- Remove all existing conflicting policies for user_profiles UPDATE
DROP POLICY IF EXISTS "Users can update their profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own data" ON public.user_profiles;
DROP POLICY IF EXISTS "User can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can safely update their profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile safely" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile except role" ON public.user_profiles;
DROP POLICY IF EXISTS "User Profile Access Control" ON public.user_profiles;

-- Create a secure function to check current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role(user_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.user_profiles WHERE id = user_id;
$$;

-- Create the new secure update policy
CREATE POLICY "Users can update their personal data"
ON public.user_profiles
FOR UPDATE
USING (
  auth.uid() = id
)
WITH CHECK (
  auth.uid() = id AND 
  role = public.get_current_user_role(auth.uid())
);