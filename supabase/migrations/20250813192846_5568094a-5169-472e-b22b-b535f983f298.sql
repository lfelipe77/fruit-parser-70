-- Fix security linter warning: Function Search Path Mutable
-- Update the set_payment_context function to have an immutable search path

DROP FUNCTION IF EXISTS public.set_payment_context();

CREATE OR REPLACE FUNCTION public.set_payment_context()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_temp'
AS $$
BEGIN
  PERFORM set_config('app.context', 'payment_processing', true);
END;
$$;