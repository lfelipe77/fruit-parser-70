-- Fix security warning for function search_path
CREATE OR REPLACE FUNCTION public.request_password_reset(user_email TEXT)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  -- This function can be called from frontend to initiate password reset
  -- The actual password reset will be handled by Supabase Auth
  IF EXISTS (SELECT 1 FROM auth.users WHERE email = user_email) THEN
    RETURN 'success';
  ELSE
    RETURN 'user_not_found';
  END IF;
END;
$$;