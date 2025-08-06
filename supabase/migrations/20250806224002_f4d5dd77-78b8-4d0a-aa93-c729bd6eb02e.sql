-- Create function to get admin logs from the view
CREATE OR REPLACE FUNCTION public.get_admin_logs()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  action text,
  context jsonb,
  created_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, user_id, action, context, created_at
  FROM admin_log_view
  ORDER BY created_at DESC;
$$;