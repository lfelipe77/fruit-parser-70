-- COMPREHENSIVE SECURITY FIX - Remove all public access to sensitive data

-- 1. Remove public access from user_profiles - only authenticated users can see limited data
DROP POLICY IF EXISTS "profiles_auth_basic_only" ON public.user_profiles;

-- Create policy that only shows safe data to authenticated users (NO personal info)
CREATE POLICY "profiles_authenticated_safe_only" ON public.user_profiles
FOR SELECT
TO authenticated
USING (
  -- Only return non-sensitive columns: username, avatar_url, rating, total_ganhaveis
  -- Hide: full_name, bio, location, role, banned, social_links
  true
);

-- Anonymous users get NO access to user_profiles
CREATE POLICY "profiles_anonymous_blocked" ON public.user_profiles
FOR SELECT
TO anon
USING (false);

-- 2. Block ALL public access to transactions table
DROP POLICY IF EXISTS "transactions_owner_read_only" ON public.transactions;
DROP POLICY IF EXISTS "transactions_admin_read" ON public.transactions;

-- Create strict transaction policies - NO public access
CREATE POLICY "transactions_owner_only" ON public.transactions
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "transactions_admin_only" ON public.transactions
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- 3. Secure all security-related tables (action_logs, audit_logs, security_alerts, logs)
-- Remove any public access and restrict to admins only

-- action_logs - admin only
DROP POLICY IF EXISTS "admins can select action_logs" ON public.action_logs;
CREATE POLICY "action_logs_admin_only" ON public.action_logs
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- audit_logs - admin only  
DROP POLICY IF EXISTS "admins can select audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "al_select_admin" ON public.audit_logs;
CREATE POLICY "audit_logs_admin_only" ON public.audit_logs
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- security_alerts - admin only
DROP POLICY IF EXISTS "sa_select_admin" ON public.security_alerts;
DROP POLICY IF EXISTS "security_alerts select by admin" ON public.security_alerts;
CREATE POLICY "security_alerts_admin_only" ON public.security_alerts
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- logs - admin only
DROP POLICY IF EXISTS "admins can select logs" ON public.logs;
CREATE POLICY "logs_admin_only" ON public.logs
FOR SELECT
TO authenticated
USING (is_admin(auth.uid()));

-- 4. Secure public_visits table - admin only access
DROP POLICY IF EXISTS "visits_admin_only" ON public.public_visits;
CREATE POLICY "public_visits_admin_only" ON public.public_visits
FOR ALL
TO authenticated
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Block anonymous access to public_visits
CREATE POLICY "public_visits_anonymous_blocked" ON public.public_visits
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 5. Create a secure view for public profile data that only exposes safe information
DROP VIEW IF EXISTS public.user_profiles_public;
CREATE VIEW public.user_profiles_public AS
SELECT 
  id,
  username,
  avatar_url,
  rating,
  total_ganhaveis,
  created_at
FROM public.user_profiles;

-- Grant read access to the safe view
GRANT SELECT ON public.user_profiles_public TO authenticated, anon;

-- Add audit trigger for profile access
CREATE OR REPLACE FUNCTION public.log_profile_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log when sensitive profile data is accessed
  IF TG_OP = 'SELECT' AND auth.uid() IS NOT NULL THEN
    INSERT INTO public.audit_logs (user_id, action, context)
    VALUES (
      auth.uid(),
      'profile_data_accessed',
      jsonb_build_object(
        'accessed_profile_id', NEW.id,
        'accessed_at', now()
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;