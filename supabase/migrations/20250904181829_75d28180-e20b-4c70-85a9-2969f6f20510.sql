-- Create RLS policy for authenticated users to read payments_pending status
CREATE POLICY IF NOT EXISTS "read payments_pending status"
ON public.payments_pending
FOR SELECT
TO authenticated
USING (true);

-- Check if there's a problematic constraint and drop it if it exists
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