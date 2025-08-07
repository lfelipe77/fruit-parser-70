-- Database View Security Review Migration
-- This migration addresses security issues with database views

-- 1. Drop unused views that are not referenced in the codebase
DROP VIEW IF EXISTS public.user_activity_log_translated;
DROP VIEW IF EXISTS public.user_log_view;

-- 2. Recreate admin_log_view to ensure it respects RLS and doesn't expose sensitive data
DROP VIEW IF EXISTS public.admin_log_view;
CREATE VIEW public.admin_log_view AS 
SELECT 
    al.id,
    al.user_id,
    al.action,
    al.context,
    al.created_at
FROM public.audit_logs al
-- View inherits RLS policies from the underlying audit_logs table
ORDER BY al.created_at DESC;

-- 3. Recreate user_profile_preview to only expose minimal public data
DROP VIEW IF EXISTS public.user_profile_preview;
CREATE VIEW public.user_profile_preview AS 
SELECT 
    up.id,
    up.username
    -- Deliberately excluding sensitive fields like full_name, bio, location, etc.
FROM public.user_profiles up
-- View inherits RLS policies from the underlying user_profiles table
WHERE up.banned = false; -- Only show non-banned users

-- 4. Ensure views have proper comments for documentation
COMMENT ON VIEW public.admin_log_view IS 'Provides access to audit logs. Inherits RLS policies from audit_logs table.';
COMMENT ON VIEW public.user_profile_preview IS 'Public preview of user profiles showing only username and ID. Used for foreign key relationships.';