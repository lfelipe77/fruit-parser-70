-- Normalize existing profile tax_id to digits-only (one-off cleanup)
UPDATE public.user_profiles
SET tax_id = regexp_replace(COALESCE(tax_id, ''), '\D', '', 'g')
WHERE tax_id IS NOT NULL AND tax_id ~ '\D';

-- Update constraint to be super permissive (length-only)
ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS chk_profiles_tax_id_digits;

ALTER TABLE public.user_profiles
  ADD CONSTRAINT chk_profiles_tax_id_digits
  CHECK (
    tax_id IS NULL OR tax_id ~ '^[0-9]{11}$' OR tax_id ~ '^[0-9]{14}$'
  );