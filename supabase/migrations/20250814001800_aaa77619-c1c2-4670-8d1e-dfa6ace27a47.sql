-- First, let's see the current is_admin function definition
CREATE OR REPLACE FUNCTION public.is_admin(p_uid uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_profiles
    WHERE id = p_uid AND role = 'admin'
  );
END;
$$;

-- Drop the problematic trigger temporarily to fix the recursion
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Recreate a simpler version that won't cause recursion
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insert basic profile without any complex checks
  INSERT INTO public.user_profiles (id, role, created_at, updated_at, banned)
  VALUES (NEW.id, 'usuario', NOW(), NOW(), false)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();