-- Remove SECURITY DEFINER from views to respect RLS policies

-- Drop and recreate admin_log_view without SECURITY DEFINER
DROP VIEW IF EXISTS public.admin_log_view;
CREATE VIEW public.admin_log_view AS
SELECT 
  id,
  user_id,
  action,
  context,
  created_at
FROM public.audit_logs
ORDER BY created_at DESC;

-- Drop and recreate user_activity_log_translated without SECURITY DEFINER
DROP VIEW IF EXISTS public.user_activity_log_translated;
CREATE VIEW public.user_activity_log_translated AS
SELECT 
  id,
  user_id,
  action,
  details,
  created_at
FROM public.action_logs
ORDER BY created_at DESC;

-- Drop and recreate user_log_view without SECURITY DEFINER
DROP VIEW IF EXISTS public.user_log_view;
CREATE VIEW public.user_log_view AS
SELECT 
  id,
  user_id,
  action,
  details,
  created_at
FROM public.action_logs
ORDER BY created_at DESC;

-- Drop and recreate user_profile_preview without SECURITY DEFINER
DROP VIEW IF EXISTS public.user_profile_preview;
CREATE VIEW public.user_profile_preview AS
SELECT 
  id,
  username
FROM public.user_profiles;