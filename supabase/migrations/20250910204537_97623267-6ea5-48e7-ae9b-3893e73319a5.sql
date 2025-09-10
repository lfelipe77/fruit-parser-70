-- Update signup trigger to populate profile fields from OAuth metadata safely
CREATE OR REPLACE FUNCTION public.handle_new_user_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_full_name text;
  v_display_name text;
  v_avatar_url text;
BEGIN
  -- Extract best-effort fields from provider metadata (Google, etc.)
  v_full_name := NULLIF(btrim(
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      concat_ws(' ', NEW.raw_user_meta_data->>'given_name', NEW.raw_user_meta_data->>'family_name')
    )
  ), '');

  v_display_name := NULLIF(btrim(
    COALESCE(
      NEW.raw_user_meta_data->>'user_name',
      NEW.raw_user_meta_data->>'preferred_username',
      v_full_name
    )
  ), '');

  v_avatar_url := NULLIF(btrim(
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture'
    )
  ), '');

  -- Upsert: create if missing; update only empty fields, never touch username/role if already set
  INSERT INTO public.user_profiles (id, full_name, display_name, avatar_url, role)
  VALUES (NEW.id, v_full_name, v_display_name, v_avatar_url, 'usuario')
  ON CONFLICT (id) DO UPDATE SET
    full_name   = COALESCE(EXCLUDED.full_name, user_profiles.full_name),
    display_name= COALESCE(EXCLUDED.display_name, user_profiles.display_name),
    avatar_url  = COALESCE(EXCLUDED.avatar_url, user_profiles.avatar_url),
    updated_at  = now();

  RETURN NEW;
END;
$$;