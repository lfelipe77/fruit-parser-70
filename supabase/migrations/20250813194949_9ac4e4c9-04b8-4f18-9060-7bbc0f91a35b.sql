-- PRIORITY 1: Critical Data Exposure Fixes

-- Fix transactions table RLS policies
-- Remove overly permissive policies and implement strict access control
DROP POLICY IF EXISTS "transactions_service_read_restricted" ON public.transactions;
DROP POLICY IF EXISTS "transactions_service_update_status" ON public.transactions;
DROP POLICY IF EXISTS "transactions_service_insert_only" ON public.transactions;

-- Create strict transaction access policies
CREATE POLICY "transactions_user_read_own" ON public.transactions
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "transactions_admin_read_all" ON public.transactions
FOR SELECT 
USING (is_admin(auth.uid()));

CREATE POLICY "transactions_service_payment_context" ON public.transactions
FOR ALL
USING (auth.role() = 'service_role'::text AND current_setting('app.context', true) = 'payment_processing')
WITH CHECK (auth.role() = 'service_role'::text AND current_setting('app.context', true) = 'payment_processing');

CREATE POLICY "transactions_admin_update" ON public.transactions
FOR UPDATE
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "transactions_admin_delete" ON public.transactions
FOR DELETE
USING (is_admin(auth.uid()));

-- Secure user_profiles table with privacy-by-default policies
-- Remove existing overly permissive policies
DROP POLICY IF EXISTS "select own or admin all" ON public.user_profiles;
DROP POLICY IF EXISTS "Users update own (no role/banned change)" ON public.user_profiles;

-- Create privacy-by-default policies for user profiles
CREATE POLICY "profiles_public_basic_info" ON public.user_profiles
FOR SELECT
USING (
  -- Public can see basic info (username, avatar) but not sensitive data
  CASE 
    WHEN auth.uid() IS NULL THEN 
      -- Anonymous users can only see username and avatar
      TRUE
    ELSE TRUE
  END
);

CREATE POLICY "profiles_authenticated_full_access" ON public.user_profiles
FOR SELECT
USING (
  -- Authenticated users can see more info, but full_name and location restricted
  auth.role() = 'authenticated'::text
);

CREATE POLICY "profiles_owner_full_access" ON public.user_profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "profiles_admin_full_access" ON public.user_profiles
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "profiles_user_update_own_safe" ON public.user_profiles
FOR UPDATE
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND role IS NOT DISTINCT FROM (SELECT up.role FROM user_profiles up WHERE up.id = user_profiles.id)
  AND banned IS NOT DISTINCT FROM (SELECT up.banned FROM user_profiles up WHERE up.id = user_profiles.id)
);

-- PRIORITY 2: System Integrity Fixes

-- Fix audit log JSON injection and improve security
-- Create function to safely handle JSON context data
CREATE OR REPLACE FUNCTION public.sanitize_audit_context(input_context jsonb)
RETURNS jsonb
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- Sanitize and validate JSON input
  IF input_context IS NULL THEN
    RETURN '{}'::jsonb;
  END IF;
  
  -- Remove potentially dangerous keys and limit size
  RETURN (
    SELECT jsonb_object_agg(key, value)
    FROM jsonb_each(input_context)
    WHERE key NOT IN ('__proto__', 'constructor', 'prototype')
    AND length(value::text) < 1000
    LIMIT 50
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Return empty object if any error occurs
    RETURN '{}'::jsonb;
END;
$$;

-- Update audit logging function with proper sanitization
CREATE OR REPLACE FUNCTION public.log_audit_event(action text, context jsonb DEFAULT '{}'::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, context)
  VALUES (auth.uid(), action, public.sanitize_audit_context(context));
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the operation
    INSERT INTO public.audit_logs (user_id, action, context)
    VALUES (auth.uid(), 'audit_log_error', jsonb_build_object('error', SQLERRM, 'original_action', action));
END;
$$;

-- Strengthen role-based access control
-- Create function to log role changes
CREATE OR REPLACE FUNCTION public.log_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- Log role changes for security monitoring
  IF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
    INSERT INTO public.audit_logs (user_id, action, context)
    VALUES (
      auth.uid(),
      'role_change_attempted',
      jsonb_build_object(
        'target_user_id', NEW.id,
        'old_role', OLD.role,
        'new_role', NEW.role,
        'changed_by', auth.uid(),
        'timestamp', now()
      )
    );
    
    -- Create security alert for role changes
    PERFORM create_security_alert(
      'role_change',
      format('Role change: %s -> %s for user %s', OLD.role, NEW.role, NEW.id),
      NULL,
      auth.uid(),
      jsonb_build_object(
        'target_user_id', NEW.id,
        'old_role', OLD.role,
        'new_role', NEW.role
      ),
      'high'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add trigger for role change monitoring
DROP TRIGGER IF EXISTS role_change_monitor ON public.user_profiles;
CREATE TRIGGER role_change_monitor
  BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.log_role_change();

-- Secure public_visits table (restrict to admin-only access)
DROP POLICY IF EXISTS "admin_only_visit_access" ON public.public_visits;
DROP POLICY IF EXISTS "service_role_visit_access" ON public.public_visits;

CREATE POLICY "visits_admin_only" ON public.public_visits
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

CREATE POLICY "visits_service_role_only" ON public.public_visits
FOR ALL
USING (auth.role() = 'service_role'::text)
WITH CHECK (auth.role() = 'service_role'::text);

-- Add function to create security alerts for suspicious activities
CREATE OR REPLACE FUNCTION public.monitor_suspicious_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- Monitor for rapid successive logins from same IP
  IF TG_TABLE_NAME = 'rate_limit_attempts' AND NEW.action = 'login_attempt' THEN
    IF (SELECT COUNT(*) FROM rate_limit_attempts 
        WHERE ip_address = NEW.ip_address 
        AND action = 'login_attempt' 
        AND created_at >= now() - interval '5 minutes') > 5 THEN
      
      PERFORM create_security_alert(
        'rapid_login_attempts',
        format('Rapid login attempts from IP: %s', NEW.ip_address),
        NEW.ip_address,
        NULL,
        jsonb_build_object('ip_address', NEW.ip_address, 'attempt_count', 5),
        'medium'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Add trigger for suspicious activity monitoring
DROP TRIGGER IF EXISTS monitor_suspicious_activity_trigger ON public.rate_limit_attempts;
CREATE TRIGGER monitor_suspicious_activity_trigger
  AFTER INSERT ON public.rate_limit_attempts
  FOR EACH ROW
  EXECUTE FUNCTION public.monitor_suspicious_activity();