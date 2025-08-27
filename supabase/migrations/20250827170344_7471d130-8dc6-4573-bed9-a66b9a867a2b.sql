-- Add missing updated_at to tickets and attach trigger
ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

-- Recreate updated_at trigger using existing function public.set_updated_at()
DROP TRIGGER IF EXISTS set_tickets_updated_at ON public.tickets;
CREATE TRIGGER set_tickets_updated_at
BEFORE UPDATE ON public.tickets
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();