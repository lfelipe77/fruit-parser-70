-- Fix search_path security warnings for privacy functions

-- Fix anonymize_ip function
CREATE OR REPLACE FUNCTION public.anonymize_ip(ip_address text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- If IPv4, replace last octet with 0
  IF ip_address ~ '^([0-9]{1,3}\.){3}[0-9]{1,3}$' THEN
    RETURN regexp_replace(ip_address, '\.[0-9]+$', '.0');
  END IF;
  
  -- If IPv6, zero out last 64 bits (keep first 64 bits for network identification)
  IF ip_address ~ '^([0-9a-fA-F]{0,4}:){2,7}[0-9a-fA-F]{0,4}$' THEN
    RETURN regexp_replace(ip_address, '([0-9a-fA-F:]+):[0-9a-fA-F:]+$', '\1::');
  END IF;
  
  -- For any other format, return anonymized placeholder
  RETURN '***.**.***.***';
END;
$$;

-- Fix anonymize_visit_data function
CREATE OR REPLACE FUNCTION public.anonymize_visit_data()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- Anonymize IP address
  IF NEW.ip_address IS NOT NULL THEN
    NEW.ip_address := public.anonymize_ip(NEW.ip_address);
  END IF;
  
  -- Truncate user agent to remove overly specific tracking data
  IF NEW.user_agent IS NOT NULL THEN
    NEW.user_agent := left(NEW.user_agent, 200);
  END IF;
  
  -- Remove query parameters from URL for privacy
  IF NEW.url IS NOT NULL THEN
    NEW.url := regexp_replace(NEW.url, '\?.*$', '');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Fix purge_old_visit_data function
CREATE OR REPLACE FUNCTION public.purge_old_visit_data()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
DECLARE 
  deleted_count integer;
BEGIN
  -- Delete visits older than 30 days to comply with privacy regulations
  DELETE FROM public.public_visits 
  WHERE created_at < NOW() - INTERVAL '30 days';
  
  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  
  -- Log the purge action
  INSERT INTO public.audit_logs (user_id, action, context)
  VALUES (
    NULL, 
    'privacy_data_purged', 
    jsonb_build_object(
      'table', 'public_visits',
      'deleted_count', deleted_count,
      'retention_days', 30
    )
  );
  
  RETURN deleted_count;
END;
$$;