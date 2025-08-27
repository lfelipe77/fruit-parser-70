-- Add constraint to prevent bad documents in profiles
ALTER TABLE public.user_profiles
  ADD CONSTRAINT IF NOT EXISTS chk_profiles_tax_id_digits
  CHECK (tax_id IS NULL OR tax_id ~ '^[0-9]{11}$' OR tax_id ~ '^[0-9]{14}$');