-- Revert to length-only validation for tax_id
ALTER TABLE public.user_profiles
  DROP CONSTRAINT IF EXISTS chk_profiles_tax_id_digits;

ALTER TABLE public.user_profiles
  ADD CONSTRAINT chk_profiles_tax_id_digits
  CHECK (tax_id IS NULL OR tax_id ~ '^[0-9]{11}$' OR tax_id ~ '^[0-9]{14}$');