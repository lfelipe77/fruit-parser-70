-- Remove conflicting policies
DROP POLICY IF EXISTS "Users can update their profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own data" ON public.user_profiles;

-- Replace with a single secure update policy (excluding role)
CREATE POLICY "Users can update their personal data"
ON public.user_profiles
FOR UPDATE
USING (
  auth.uid() = id
)
WITH CHECK (
  auth.uid() = id AND role = old.role
);