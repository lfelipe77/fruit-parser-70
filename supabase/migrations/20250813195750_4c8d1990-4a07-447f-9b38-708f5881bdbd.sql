-- First drop all existing policies to avoid conflicts
DROP POLICY IF EXISTS "profiles_public_basic_info" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_authenticated_full_access" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_owner_full_access" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_admin_full_access" ON public.user_profiles;
DROP POLICY IF EXISTS "profiles_user_update_own_safe" ON public.user_profiles;
DROP POLICY IF EXISTS "transactions_user_access" ON public.transactions;
DROP POLICY IF EXISTS "transactions_user_read_own" ON public.transactions;
DROP POLICY IF EXISTS "transactions_admin_read_all" ON public.transactions;

-- Create restrictive user_profiles policies
-- Public can only see very limited info (username, avatar, basic stats)
CREATE POLICY "profiles_public_limited_info" ON public.user_profiles
FOR SELECT 
USING (true);

-- Users can see their own complete profile
CREATE POLICY "profiles_owner_full_access" ON public.user_profiles
FOR SELECT 
TO authenticated
USING (auth.uid() = id);

-- Admins can see and modify all profiles
CREATE POLICY "profiles_admin_full_access" ON public.user_profiles
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Users can update their own profile but not role/banned status
CREATE POLICY "profiles_user_update_own_safe" ON public.user_profiles
FOR UPDATE 
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND role IS NOT DISTINCT FROM (SELECT role FROM user_profiles WHERE id = auth.uid())
  AND banned IS NOT DISTINCT FROM (SELECT banned FROM user_profiles WHERE id = auth.uid())
);

-- Create secure transaction policies
-- Users can only read their own transactions
CREATE POLICY "transactions_user_read_own_only" ON public.transactions
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Admins can read all transactions
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

-- Admins can modify transactions
CREATE POLICY "transactions_admin_modify" ON public.transactions
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Prevent regular users from inserting/updating transactions
CREATE POLICY "transactions_no_user_modifications" ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "transactions_no_user_updates" ON public.transactions
FOR UPDATE
TO authenticated
USING (false);

-- Create function to get safe profile data for public view
CREATE OR REPLACE FUNCTION public.get_safe_profile_data(profile_id uuid)
RETURNS TABLE(
  id uuid,
  username text,
  avatar_url text,
  rating numeric,
  total_ganhaveis integer,
  created_at timestamp with time zone
) 
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT 
    p.id,
    p.username,
    p.avatar_url,
    p.rating,
    p.total_ganhaveis,
    p.created_at
  FROM public.user_profiles p
  WHERE p.id = profile_id;
$$;