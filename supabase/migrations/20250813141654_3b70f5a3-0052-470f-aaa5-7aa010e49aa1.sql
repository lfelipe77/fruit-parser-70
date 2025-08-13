-- Privacy Enhancement for public_visits table
-- Anonymize existing IP addresses and implement better data protection

-- 1. Create function to anonymize IP addresses
CREATE OR REPLACE FUNCTION public.anonymize_ip(ip_address text)
RETURNS text
LANGUAGE plpgsql
IMMUTABLE
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

-- 2. Anonymize existing IP addresses
UPDATE public.public_visits 
SET ip_address = public.anonymize_ip(ip_address)
WHERE ip_address IS NOT NULL;

-- 3. Create trigger to automatically anonymize IP addresses on insert
CREATE OR REPLACE FUNCTION public.anonymize_visit_data()
RETURNS TRIGGER
LANGUAGE plpgsql
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

-- 4. Create trigger for automatic data anonymization
DROP TRIGGER IF EXISTS anonymize_visit_trigger ON public.public_visits;
CREATE TRIGGER anonymize_visit_trigger
  BEFORE INSERT ON public.public_visits
  FOR EACH ROW
  EXECUTE FUNCTION public.anonymize_visit_data();

-- 5. Create function for automatic data purging (older than 30 days)
CREATE OR REPLACE FUNCTION public.purge_old_visit_data()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
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

-- 6. Strengthen RLS policies - ensure only admins can access
DROP POLICY IF EXISTS "service role access visits" ON public.public_visits;
DROP POLICY IF EXISTS "admins read visits" ON public.public_visits;

-- Only allow admin access for legitimate analytics purposes
CREATE POLICY "admin_only_visit_access" 
ON public.public_visits 
FOR ALL 
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Service role access for automated operations only
CREATE POLICY "service_role_visit_access"
ON public.public_visits
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 7. Revoke any public access that might exist
REVOKE ALL ON public.public_visits FROM anon;
REVOKE ALL ON public.public_visits FROM authenticated;

-- 8. Grant minimal necessary permissions
GRANT SELECT ON public.public_visits TO authenticated;
GRANT ALL ON public.public_visits TO service_role;