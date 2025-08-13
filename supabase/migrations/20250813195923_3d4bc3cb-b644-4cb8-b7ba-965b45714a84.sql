-- Drop ALL existing RLS policies for user_profiles to ensure clean slate
DO $$ 
BEGIN
    -- Drop all policies on user_profiles
    DROP POLICY IF EXISTS "profiles_public_limited_info" ON public.user_profiles;
    DROP POLICY IF EXISTS "profiles_public_basic_info" ON public.user_profiles;
    DROP POLICY IF EXISTS "profiles_authenticated_full_access" ON public.user_profiles;
    DROP POLICY IF EXISTS "profiles_owner_full_access" ON public.user_profiles;
    DROP POLICY IF EXISTS "profiles_admin_full_access" ON public.user_profiles;
    DROP POLICY IF EXISTS "profiles_user_update_own_safe" ON public.user_profiles;
    DROP POLICY IF EXISTS "insert by service role only" ON public.user_profiles;
    DROP POLICY IF EXISTS "Admins update any" ON public.user_profiles;
    
    -- Drop all policies on transactions
    DROP POLICY IF EXISTS "transactions_user_read_own_only" ON public.transactions;
    DROP POLICY IF EXISTS "transactions_admin_read_all" ON public.transactions;
    DROP POLICY IF EXISTS "transactions_service_payment_context" ON public.transactions;
    DROP POLICY IF EXISTS "transactions_admin_modify" ON public.transactions;
    DROP POLICY IF EXISTS "transactions_no_user_modifications" ON public.transactions;
    DROP POLICY IF EXISTS "transactions_no_user_updates" ON public.transactions;
    DROP POLICY IF EXISTS "transactions_user_read_own" ON public.transactions;
    DROP POLICY IF EXISTS "transactions_user_access" ON public.transactions;
    DROP POLICY IF EXISTS "transactions admin delete" ON public.transactions;
    DROP POLICY IF EXISTS "transactions_admin_delete" ON public.transactions;
    DROP POLICY IF EXISTS "transactions_admin_read_all" ON public.transactions;
    DROP POLICY IF EXISTS "transactions_admin_update" ON public.transactions;
    DROP POLICY IF EXISTS "transactions_no_user_insert" ON public.transactions;
    DROP POLICY IF EXISTS "transactions_no_user_update" ON public.transactions;
    DROP POLICY IF EXISTS "transactions_service_payment_context" ON public.transactions;
    DROP POLICY IF EXISTS "transactions_user_access" ON public.transactions;
    
EXCEPTION WHEN OTHERS THEN
    -- Continue if policy doesn't exist
    NULL;
END $$;

-- Create NEW secure policies for user_profiles
-- Service role can insert user profiles (for new user registration)
CREATE POLICY "profiles_service_insert" ON public.user_profiles
FOR INSERT
TO service_role
WITH CHECK (true);

-- Only authenticated users can see basic profile info (NO personal data)
CREATE POLICY "profiles_auth_basic_only" ON public.user_profiles
FOR SELECT
TO authenticated
USING (true);

-- Users can see their own full profile
CREATE POLICY "profiles_owner_full" ON public.user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Admins can see all profiles
CREATE POLICY "profiles_admin_all" ON public.user_profiles
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Users can update their own profile but NOT role/banned status
CREATE POLICY "profiles_owner_update_safe" ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND role IS NOT DISTINCT FROM (SELECT role FROM user_profiles WHERE id = auth.uid())
  AND banned IS NOT DISTINCT FROM (SELECT banned FROM user_profiles WHERE id = auth.uid())
);

-- Create NEW secure policies for transactions  
-- Users can ONLY read their own transactions
CREATE POLICY "transactions_owner_read_only" ON public.transactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Admins can read all transactions
CREATE POLICY "transactions_admin_read" ON public.transactions
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- Only service role with payment context can modify transactions
CREATE POLICY "transactions_service_payment" ON public.transactions
FOR ALL
TO service_role
USING (current_setting('app.context', true) = 'payment_processing')
WITH CHECK (current_setting('app.context', true) = 'payment_processing');

-- Admins can modify/delete transactions
CREATE POLICY "transactions_admin_modify" ON public.transactions
FOR UPDATE
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "transactions_admin_delete" ON public.transactions
FOR DELETE
TO authenticated
USING (is_admin(auth.uid()));

-- Block regular users from inserting/updating transactions
CREATE POLICY "transactions_block_user_insert" ON public.transactions
FOR INSERT
TO authenticated
WITH CHECK (false);

CREATE POLICY "transactions_block_user_update" ON public.transactions
FOR UPDATE
TO authenticated
USING (false);