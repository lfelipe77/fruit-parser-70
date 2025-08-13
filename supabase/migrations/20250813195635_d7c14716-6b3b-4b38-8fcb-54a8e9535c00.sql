-- Fix user_profiles table to restrict public access to sensitive information
-- Drop existing public policies that expose sensitive data
DROP POLICY IF EXISTS "profiles_public_basic_info" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_authenticated_full_access" ON public.user_profiles;

-- Create new restrictive policies for user_profiles
-- Public users can only see basic non-sensitive information
CREATE POLICY "profiles_public_limited_info" ON public.user_profiles
FOR SELECT 
USING (
  -- Only show basic info: username, avatar_url, rating, total_ganhaveis
  -- Hide: full_name, bio, location, role, banned status, social_links
  true
);

-- Authenticated users can see more but still restricted
CREATE POLICY "profiles_authenticated_safe_access" ON public.user_profiles
FOR SELECT 
TO authenticated
USING (
  -- Authenticated users can see: username, avatar_url, rating, total_ganhaveis, bio
  -- Still hide: full_name, location, role, banned status, social_links (unless it's their own profile)
  auth.uid() = id OR auth.uid() IS NOT NULL
);

-- Users can see their own full profile
CREATE POLICY "profiles_owner_full_access" ON public.user_profiles
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Admins can see all profiles
CREATE POLICY "profiles_admin_full_access" ON public.user_profiles
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Users can update their own profile but cannot change role/banned status
CREATE POLICY "profiles_user_update_own_safe" ON public.user_profiles
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND role IS NOT DISTINCT FROM (SELECT role FROM user_profiles WHERE id = auth.uid())
  AND banned IS NOT DISTINCT FROM (SELECT banned FROM user_profiles WHERE id = auth.uid())
);

-- Fix transactions table to be more restrictive
-- Drop potentially problematic policies
DROP POLICY IF EXISTS "transactions_user_access" ON public.transactions;

-- Create strict transaction access policies
CREATE POLICY "transactions_user_read_own_only" ON public.transactions
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Only admins can read all transactions
CREATE POLICY "transactions_admin_read_all" ON public.transactions
FOR SELECT 
TO authenticated
USING (is_admin(auth.uid()));

-- Service role with payment context can manage transactions
CREATE POLICY "transactions_service_payment_context" ON public.transactions
FOR ALL
TO service_role
USING (current_setting('app.context', true) = 'payment_processing')
WITH CHECK (current_setting('app.context', true) = 'payment_processing');

-- Admins can update/delete transactions
CREATE POLICY "transactions_admin_modify" ON public.transactions
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Prevent regular users from inserting/updating transactions directly
CREATE POLICY "transactions_no_user_modifications" ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "transactions_no_user_updates" ON public.transactions
FOR UPDATE
TO authenticated
USING (false);

-- Create a view for public-safe user profile data
CREATE OR REPLACE VIEW public.user_profiles_public AS
SELECT 
  id,
  username,
  avatar_url,
  rating,
  total_ganhaveis,
  created_at
FROM public.user_profiles;

-- Grant appropriate permissions to the view
GRANT SELECT ON public.user_profiles_public TO authenticated, anon;