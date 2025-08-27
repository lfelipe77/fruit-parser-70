-- One-off DB normalization (safe to re-run)
UPDATE public.user_profiles
SET tax_id = regexp_replace(coalesce(tax_id,''), '\D', '', 'g')
WHERE tax_id IS NOT NULL AND tax_id ~ '\D';