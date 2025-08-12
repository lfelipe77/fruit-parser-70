-- Harden RLS on transactions without breaking functionality
-- 1) Ensure RLS is enabled
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- 2) Replace any broad service policy with granular service-only policies
DROP POLICY IF EXISTS "transactions service full" ON public.transactions;

-- Allow service role to insert (edge functions, back-office jobs)
CREATE POLICY "transactions service insert"
ON public.transactions
FOR INSERT
TO service_role
WITH CHECK (true);

-- Allow service role to update (status syncs, references, etc.)
CREATE POLICY "transactions service update"
ON public.transactions
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Allow service role to select when needed by server processes
CREATE POLICY "transactions service select"
ON public.transactions
FOR SELECT
TO service_role
USING (true);

-- 3) Keep existing owner/admin SELECT policy as-is; add one if missing (idempotent safety)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'transactions' 
      AND policyname = 'transactions select own or admin'
  ) THEN
    CREATE POLICY "transactions select own or admin"
    ON public.transactions
    FOR SELECT
    TO authenticated
    USING ((auth.uid() = user_id) OR public.is_admin(auth.uid()));
  END IF;
END$$;

-- 4) Explicitly disallow client-side DELETE by omission (no delete policies). If desired, allow admin deletes only.
-- Admin-only delete (optional, safe)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'transactions' 
      AND policyname = 'transactions admin delete'
  ) THEN
    CREATE POLICY "transactions admin delete"
    ON public.transactions
    FOR DELETE
    TO authenticated
    USING (public.is_admin(auth.uid()));
  END IF;
END$$;