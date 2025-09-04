-- Create RLS policy (idempotent) allowing authenticated users to read payments_pending status
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
      AND tablename = 'payments_pending' 
      AND policyname = 'read payments_pending status'
  ) THEN
    CREATE POLICY "read payments_pending status"
    ON public.payments_pending
    FOR SELECT
    TO authenticated
    USING (true);
  END IF;
END $$;

-- Drop conflicting CHECK constraint that blocks storing provider payment id while pending
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'payments_pending_pid_null_when_pending'
  ) THEN
    ALTER TABLE public.payments_pending 
    DROP CONSTRAINT payments_pending_pid_null_when_pending;
  END IF;
END $$;
