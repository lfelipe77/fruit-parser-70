-- Fix the security definer view issues by removing them and recreating the admin_log_view properly
-- Simply recreate the admin_log_view without any SECURITY clauses

-- Drop any problematic views
DROP VIEW IF EXISTS public.admin_log_view CASCADE;
DROP VIEW IF EXISTS public.user_profiles_public CASCADE;
DROP VIEW IF EXISTS public.user_profile_preview CASCADE;

-- Recreate admin_log_view as a simple view (default is SECURITY INVOKER)
CREATE VIEW public.admin_log_view AS
SELECT 
  al.id,
  al.user_id,
  al.action,
  al.context,
  al.created_at,
  up.username,
  up.full_name,
  up.role as user_role
FROM audit_logs al
LEFT JOIN user_profiles up ON al.user_id = up.id
ORDER BY al.created_at DESC;

-- Grant permissions for admin access
GRANT SELECT ON public.admin_log_view TO authenticated;

-- Recreate user_profiles_public as a simple view
CREATE VIEW public.user_profiles_public AS
SELECT 
  id,
  username,
  avatar_url,
  rating,
  total_ganhaveis,
  created_at
FROM user_profiles
WHERE NOT banned;

-- Grant permissions
GRANT SELECT ON public.user_profiles_public TO anon, authenticated;

-- Recreate user_profile_preview as a simple view
CREATE VIEW public.user_profile_preview AS
SELECT 
  id,
  username
FROM user_profiles
WHERE NOT banned;

-- Grant permissions
GRANT SELECT ON public.user_profile_preview TO anon, authenticated;