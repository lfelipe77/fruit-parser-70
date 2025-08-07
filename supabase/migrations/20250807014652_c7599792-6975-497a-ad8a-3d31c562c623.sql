-- Drop existing functions first to avoid conflicts
DROP FUNCTION IF EXISTS public.get_admin_logs();
DROP FUNCTION IF EXISTS public.get_current_user_role(uuid);
DROP FUNCTION IF EXISTS public.update_user_role(uuid, text);
DROP FUNCTION IF EXISTS public.notify_security_alert();
DROP FUNCTION IF EXISTS public.should_log_visit(text, text);
DROP FUNCTION IF EXISTS public.log_public_visit(text, text, text, text, text, text);

-- Recreate functions with proper security settings

-- 1. Create secure get_admin_logs function
CREATE OR REPLACE FUNCTION public.get_admin_logs()
RETURNS TABLE (
  id uuid,
  created_at timestamp with time zone,
  user_id uuid,
  action text,
  context jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user has admin role
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied - admin role required';
  END IF;
  
  RETURN QUERY
  SELECT 
    al.id,
    al.created_at,
    al.user_id,
    al.action,
    al.context
  FROM public.audit_logs al
  ORDER BY al.created_at DESC;
END;
$$;

-- 2. Create secure get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role
  FROM public.user_profiles 
  WHERE id = auth.uid();
  
  RETURN COALESCE(user_role, '');
END;
$$;

-- 3. Create secure update_user_role function
CREATE OR REPLACE FUNCTION public.update_user_role(
  target_user_id uuid,
  new_role text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied - admin role required';
  END IF;
  
  UPDATE public.user_profiles 
  SET role = new_role
  WHERE id = target_user_id;
  
  RETURN FOUND;
END;
$$;

-- 4. Update notify_security_alert function (keep existing implementation but add security)
CREATE OR REPLACE FUNCTION public.notify_security_alert(
  alert_type text,
  alert_description text,
  alert_severity text DEFAULT 'medium',
  alert_context jsonb DEFAULT '{}'::jsonb,
  alert_ip_address text DEFAULT NULL,
  alert_user_id uuid DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  alert_id uuid;
BEGIN
  INSERT INTO public.security_alerts (
    type, 
    description, 
    severity, 
    context, 
    ip_address, 
    user_id
  )
  VALUES (
    alert_type,
    alert_description,
    alert_severity::security_alert_severity,
    alert_context,
    alert_ip_address,
    alert_user_id
  )
  RETURNING id INTO alert_id;
  
  RETURN alert_id;
END;
$$;

-- 5. Update should_log_visit function
CREATE OR REPLACE FUNCTION public.should_log_visit(
  visitor_ip inet,
  visitor_user_agent text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  recent_visit_count integer;
  is_bot boolean := false;
BEGIN
  -- Check if user agent indicates a bot
  IF visitor_user_agent ~* '(bot|crawler|spider|scraper)' THEN
    is_bot := true;
  END IF;
  
  -- Don't log bot visits
  IF is_bot THEN
    RETURN false;
  END IF;
  
  -- Count recent visits from same IP in last 5 minutes
  SELECT COUNT(*) INTO recent_visit_count
  FROM public.public_visits
  WHERE ip_address = visitor_ip
    AND created_at > NOW() - INTERVAL '5 minutes';
  
  -- Only log if less than 5 visits in last 5 minutes
  RETURN recent_visit_count < 5;
END;
$$;

-- 6. Update log_public_visit function
CREATE OR REPLACE FUNCTION public.log_public_visit(
  visitor_ip inet,
  visitor_user_agent text,
  page_path text,
  referrer text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  visit_id uuid;
BEGIN
  -- Check if we should log this visit
  IF NOT public.should_log_visit(visitor_ip, visitor_user_agent) THEN
    RETURN NULL;
  END IF;
  
  INSERT INTO public.public_visits (
    ip_address,
    user_agent,
    page_path,
    referrer
  )
  VALUES (
    visitor_ip,
    visitor_user_agent,
    page_path,
    referrer
  )
  RETURNING id INTO visit_id;
  
  RETURN visit_id;
END;
$$;