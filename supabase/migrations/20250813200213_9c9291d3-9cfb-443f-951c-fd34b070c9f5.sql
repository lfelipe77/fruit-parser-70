-- FINAL SECURITY LOCKDOWN - Block all public access to sensitive tables

-- 1. Fix user_profiles - completely block public access
-- Drop the problematic view that creates security definer issues
DROP VIEW IF EXISTS public.user_profiles_public CASCADE;

-- Block ALL access for anonymous users to user_profiles
DROP POLICY IF EXISTS "profiles_anonymous_blocked" ON public.user_profiles;
CREATE POLICY "profiles_no_public_access" ON public.user_profiles
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 2. Block ALL public access to transactions
CREATE POLICY "transactions_no_public_access" ON public.transactions
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 3. Block ALL public access to public_visits
CREATE POLICY "public_visits_no_public_access" ON public.public_visits
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 4. Block ALL public access to security_alerts
CREATE POLICY "security_alerts_no_public_access" ON public.security_alerts
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 5. Block ALL public access to audit_logs
CREATE POLICY "audit_logs_no_public_access" ON public.audit_logs
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 6. Block ALL public access to action_logs  
CREATE POLICY "action_logs_no_public_access" ON public.action_logs
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 7. Block ALL public access to logs
CREATE POLICY "logs_no_public_access" ON public.logs
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Fix the search path for the function that was causing warnings
DROP FUNCTION IF EXISTS public.log_profile_access() CASCADE;
CREATE OR REPLACE FUNCTION public.log_profile_access()
RETURNS TRIGGER 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;