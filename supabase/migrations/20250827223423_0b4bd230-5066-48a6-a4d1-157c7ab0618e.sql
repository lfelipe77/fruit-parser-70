-- Add constraint to prevent bad documents in profiles (Postgres doesn't support IF NOT EXISTS for CHECK)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint c
    JOIN pg_class t ON t.oid = c.conrelid
    JOIN pg_namespace n ON n.oid = t.relnamespace
    WHERE c.conname = 'chk_profiles_tax_id_digits'
      AND n.nspname = 'public'
      AND t.relname = 'user_profiles'
  ) THEN
    ALTER TABLE public.user_profiles
      ADD CONSTRAINT chk_profiles_tax_id_digits
      CHECK (tax_id IS NULL OR tax_id ~ '^[0-9]{11}$' OR tax_id ~ '^[0-9]{14}$');
  END IF;
END$$;