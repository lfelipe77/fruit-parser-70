-- Fix RLS and view security issues

-- 1. Enable RLS on audit_logs table that was missing it
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 2. Create RLS policy for audit_logs - only admins can view audit logs
CREATE POLICY "Only admins can view audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 3. Allow system (service role) to insert audit logs
CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);