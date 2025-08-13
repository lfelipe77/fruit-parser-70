-- Fix security issue: Restrict transactions table access to prevent public data exposure

-- Drop overly permissive service role policies
DROP POLICY IF EXISTS "transactions service select" ON public.transactions;
DROP POLICY IF EXISTS "transactions service insert" ON public.transactions;
DROP POLICY IF EXISTS "transactions service update" ON public.transactions;

-- Create more restrictive service role policies
-- Service role can insert transactions (needed for payment processing)
CREATE POLICY "transactions_service_insert_only" 
ON public.transactions 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Service role can update transaction status (needed for payment webhooks)
CREATE POLICY "transactions_service_update_status" 
ON public.transactions 
FOR UPDATE 
TO service_role
USING (true)
WITH CHECK (true);

-- Service role can only read transactions when specifically needed (more restrictive)
-- This policy should only be used by specific edge functions that need full access
CREATE POLICY "transactions_service_read_restricted" 
ON public.transactions 
FOR SELECT 
TO service_role
USING (
  -- Only allow service role to read during payment processing contexts
  -- This can be expanded with specific conditions as needed
  current_setting('app.context', true) = 'payment_processing'
);

-- Ensure the existing user access policy is properly defined
DROP POLICY IF EXISTS "transactions select own or admin" ON public.transactions;
CREATE POLICY "transactions_user_access" 
ON public.transactions 
FOR SELECT 
TO authenticated
USING (
  -- Users can only see their own transactions
  auth.uid() = user_id 
  OR 
  -- Admins can see all transactions
  (
    SELECT role FROM public.user_profiles 
    WHERE id = auth.uid() 
    LIMIT 1
  ) = 'admin'
);

-- Ensure users cannot insert transactions directly (only through service)
CREATE POLICY "transactions_no_user_insert" 
ON public.transactions 
FOR INSERT 
TO authenticated
WITH CHECK (false);

-- Ensure users cannot update transactions directly
CREATE POLICY "transactions_no_user_update" 
ON public.transactions 
FOR UPDATE 
TO authenticated
USING (false);

-- Create function to safely set payment processing context
CREATE OR REPLACE FUNCTION public.set_payment_context()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM set_config('app.context', 'payment_processing', true);
END;
$$;