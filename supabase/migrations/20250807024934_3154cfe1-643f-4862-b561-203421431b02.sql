-- Enhanced audit logging functions and enhanced admin view
-- Create enhanced audit logging functions that integrate with existing system

CREATE OR REPLACE FUNCTION public.log_bulk_admin_action(
  action_type text,
  affected_ids uuid[],
  reason text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  -- Log the bulk action
  INSERT INTO audit_logs (user_id, action, context)
  VALUES (
    auth.uid(),
    'bulk_action_performed',
    jsonb_build_object(
      'action_type', action_type,
      'affected_count', array_length(affected_ids, 1),
      'affected_ids', affected_ids,
      'reason', reason,
      'bulk_operation', true,
      'timestamp', now()
    )
  );

  -- Create security alert for bulk operations
  PERFORM create_security_alert(
    'admin_action',
    format('Bulk admin action performed: %s affecting %s items', 
           action_type, array_length(affected_ids, 1)),
    NULL,
    auth.uid(),
    jsonb_build_object(
      'action_type', action_type,
      'affected_count', array_length(affected_ids, 1),
      'bulk_operation', true
    ),
    CASE 
      WHEN array_length(affected_ids, 1) > 10 THEN 'high'
      WHEN array_length(affected_ids, 1) > 5 THEN 'medium'
      ELSE 'low'
    END
  );
END;
$$;

-- Create function to get audit statistics for admin dashboard
CREATE OR REPLACE FUNCTION public.get_audit_statistics(
  days_back integer DEFAULT 7
)
RETURNS TABLE(
  total_events bigint,
  login_events bigint,
  admin_actions bigint,
  payment_events bigint,
  security_events bigint,
  top_actions jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  start_date timestamp with time zone;
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  start_date := now() - (days_back || ' days')::interval;

  RETURN QUERY
  SELECT 
    (SELECT COUNT(*) FROM audit_logs WHERE created_at >= start_date) as total_events,
    (SELECT COUNT(*) FROM audit_logs 
     WHERE created_at >= start_date 
     AND (action LIKE '%login%' OR action LIKE '%logout%' OR action LIKE '%signup%')) as login_events,
    (SELECT COUNT(*) FROM audit_logs 
     WHERE created_at >= start_date 
     AND (action LIKE '%banned%' OR action LIKE '%role%' OR action LIKE '%raffle_%' OR action LIKE '%admin_%')) as admin_actions,
    (SELECT COUNT(*) FROM audit_logs 
     WHERE created_at >= start_date 
     AND (action LIKE '%payment%' OR action LIKE '%ticket%' OR action LIKE '%pix%')) as payment_events,
    (SELECT COUNT(*) FROM security_alerts WHERE created_at >= start_date) as security_events,
    (SELECT jsonb_agg(
       jsonb_build_object(
         'action', action,
         'count', action_count
       ) ORDER BY action_count DESC
     )
     FROM (
       SELECT action, COUNT(*) as action_count
       FROM audit_logs 
       WHERE created_at >= start_date
       GROUP BY action
       ORDER BY COUNT(*) DESC
       LIMIT 10
     ) top_actions_subquery
    ) as top_actions;
END;
$$;

-- Create function to search audit logs with filters
CREATE OR REPLACE FUNCTION public.search_audit_logs(
  search_user_id uuid DEFAULT NULL,
  search_action text DEFAULT NULL,
  search_context text DEFAULT NULL,
  days_back integer DEFAULT 30,
  limit_results integer DEFAULT 100
)
RETURNS TABLE(
  id uuid,
  user_id uuid,
  action text,
  context jsonb,
  created_at timestamp with time zone,
  user_email text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  start_date timestamp with time zone;
BEGIN
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;

  start_date := now() - (days_back || ' days')::interval;

  RETURN QUERY
  SELECT 
    al.id,
    al.user_id,
    al.action,
    al.context,
    al.created_at,
    COALESCE(au.email, 'anonymous') as user_email
  FROM audit_logs al
  LEFT JOIN auth.users au ON al.user_id = au.id
  WHERE al.created_at >= start_date
    AND (search_user_id IS NULL OR al.user_id = search_user_id)
    AND (search_action IS NULL OR al.action ILIKE '%' || search_action || '%')
    AND (search_context IS NULL OR al.context::text ILIKE '%' || search_context || '%')
  ORDER BY al.created_at DESC
  LIMIT limit_results;
END;
$$;

-- Create indexes for better performance on audit logs
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id_created_at 
  ON audit_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action_created_at 
  ON audit_logs(action, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_context_gin 
  ON audit_logs USING gin(context);

COMMENT ON FUNCTION public.log_bulk_admin_action IS 'Logs bulk administrative actions with security monitoring';
COMMENT ON FUNCTION public.get_audit_statistics IS 'Returns comprehensive audit statistics for admin dashboard';
COMMENT ON FUNCTION public.search_audit_logs IS 'Advanced search functionality for audit logs with admin access control';