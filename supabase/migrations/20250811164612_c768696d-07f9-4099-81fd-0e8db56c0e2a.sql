-- Create triggers to sanitize public visits and mask audit PII
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_sanitize_public_visits'
  ) THEN
    CREATE TRIGGER trg_sanitize_public_visits
    BEFORE INSERT ON public.public_visits
    FOR EACH ROW
    EXECUTE FUNCTION public.sanitize_visit_row();
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'trg_mask_audit_pii'
  ) THEN
    CREATE TRIGGER trg_mask_audit_pii
    BEFORE INSERT ON public.audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION public.mask_audit_pii();
  END IF;
END $$;