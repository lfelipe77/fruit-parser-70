-- Create payments_pending table for tracking PIX pending payments
CREATE TABLE IF NOT EXISTS public.payments_pending (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reservation_id UUID UNIQUE NOT NULL,
  asaas_payment_id TEXT UNIQUE NOT NULL,
  amount NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING',
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.payments_pending ENABLE ROW LEVEL SECURITY;

-- Service role can insert
CREATE POLICY "payments_pending_service_insert"
ON public.payments_pending
FOR INSERT
WITH CHECK (auth.role() = 'service_role');

-- Service role can update
CREATE POLICY "payments_pending_service_update"
ON public.payments_pending
FOR UPDATE
USING (auth.role() = 'service_role')
WITH CHECK (auth.role() = 'service_role');

-- Service role can delete
CREATE POLICY "payments_pending_service_delete"
ON public.payments_pending
FOR DELETE
USING (auth.role() = 'service_role');

-- Admins can read
CREATE POLICY "payments_pending_admin_read"
ON public.payments_pending
FOR SELECT
USING (is_admin(auth.uid()));

-- Updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_payments_pending_updated_at'
  ) THEN
    CREATE TRIGGER set_payments_pending_updated_at
    BEFORE UPDATE ON public.payments_pending
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();
  END IF;
END $$;