-- Add 3-argument overload for log_audit_event to support JSON RPC wrapper
CREATE OR REPLACE FUNCTION public.log_audit_event(action text, context jsonb, actor_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.audit_logs (user_id, action, context)
  VALUES (actor_id, action, context);
END;
$$;