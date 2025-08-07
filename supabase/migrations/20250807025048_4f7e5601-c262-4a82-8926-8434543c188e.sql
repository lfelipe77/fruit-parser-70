-- Fix security definer view issues
-- According to Supabase best practices, views should not use SECURITY DEFINER
-- Instead, we should use RLS policies and SECURITY INVOKER

-- First, drop the problematic views
DROP VIEW IF EXISTS public.admin_log_view CASCADE;
DROP VIEW IF EXISTS public.user_profiles_public CASCADE;
DROP VIEW IF EXISTS public.user_profile_preview CASCADE;

-- Recreate admin_log_view with SECURITY INVOKER (default) and proper RLS
CREATE VIEW public.admin_log_view 
SECURITY INVOKER
AS
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

-- Enable RLS on the view
ALTER VIEW public.admin_log_view SET (security_barrier = true);

-- Create RLS policy for admin access to the view
CREATE POLICY "Admins can view audit log view" ON public.admin_log_view
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Recreate user_profiles_public with SECURITY INVOKER
CREATE VIEW public.user_profiles_public
SECURITY INVOKER
AS
SELECT 
  id,
  username,
  avatar_url,
  rating,
  total_ganhaveis,
  created_at
FROM user_profiles
WHERE NOT banned;

-- Enable RLS and create policy for public access
ALTER VIEW public.user_profiles_public SET (security_barrier = true);

CREATE POLICY "Public can view non-banned user profiles" ON public.user_profiles_public
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Recreate user_profile_preview with SECURITY INVOKER
CREATE VIEW public.user_profile_preview
SECURITY INVOKER
AS
SELECT 
  id,
  username
FROM user_profiles
WHERE NOT banned;

-- Enable RLS and create policy
ALTER VIEW public.user_profile_preview SET (security_barrier = true);

CREATE POLICY "Public can view user preview" ON public.user_profile_preview
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Grant permissions
GRANT SELECT ON public.admin_log_view TO authenticated;
GRANT SELECT ON public.user_profiles_public TO anon, authenticated;
GRANT SELECT ON public.user_profile_preview TO anon, authenticated;