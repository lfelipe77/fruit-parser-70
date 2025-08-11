-- Create BEFORE INSERT triggers for sanitization and PII masking
-- Ensure idempotency by dropping existing triggers first

-- Sanitize path-only URLs and user agent lengths on public_visits
DROP TRIGGER IF EXISTS trg_sanitize_public_visits ON public.public_visits;
CREATE TRIGGER trg_sanitize_public_visits
BEFORE INSERT ON public.public_visits
FOR EACH ROW
EXECUTE FUNCTION public.sanitize_visit_row();

-- Mask PII on audit_logs inserts
DROP TRIGGER IF EXISTS trg_mask_audit_pii ON public.audit_logs;
CREATE TRIGGER trg_mask_audit_pii
BEFORE INSERT ON public.audit_logs
FOR EACH ROW
EXECUTE FUNCTION public.mask_audit_pii();