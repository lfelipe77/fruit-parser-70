-- CRITICAL SECURITY FIX: Remove all conflicting policies and create secure ones

-- 1. Drop ALL existing policies on user_profiles (there are 30+ conflicting ones!)
DROP POLICY IF EXISTS "Admin Profile Viewing Policy" ON public.user_profiles;
DROP POLICY IF EXISTS "Admin Role Update Protection" ON public.user_profiles;
DROP POLICY IF EXISTS "Admin acessa todos os perfis" ON public.user_profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admin can view all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admin profile viewing" ON public.user_profiles;
DROP POLICY IF EXISTS "Admin profile viewing policy" ON public.user_profiles;
DROP POLICY IF EXISTS "Admin role update protection" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "No one can delete user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Only admins can update role" ON public.user_profiles;
DROP POLICY IF EXISTS "Prevent User Profile Deletion" ON public.user_profiles;
DROP POLICY IF EXISTS "Prevent all user profile deletions" ON public.user_profiles;
DROP POLICY IF EXISTS "Prevent profile deletion" ON public.user_profiles;
DROP POLICY IF EXISTS "Prevent unauthorized role change" ON public.user_profiles;
DROP POLICY IF EXISTS "Prevent user profile deletion" ON public.user_profiles;
DROP POLICY IF EXISTS "Prevent users from updating to admin role" ON public.user_profiles;
DROP POLICY IF EXISTS "Profile deletion permission" ON public.user_profiles;
DROP POLICY IF EXISTS "Public Profile Viewing Policy" ON public.user_profiles;
DROP POLICY IF EXISTS "Public can read user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Public can view all user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Public can view profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Public can view user profiles" ON public.user_profiles;
DROP POLICY IF EXISTS "Public profile access" ON public.user_profiles;
DROP POLICY IF EXISTS "Public profile view" ON public.user_profiles;
DROP POLICY IF EXISTS "Public profile viewing policy" ON public.user_profiles;
DROP POLICY IF EXISTS "User can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can read their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their personal data" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Usuário vê seu perfil" ON public.user_profiles;

-- 2. Create SECURE, minimal policies for user_profiles
-- Only allow users to view their own profile OR admins to view all
CREATE POLICY "Secure user profile access" 
ON public.user_profiles 
FOR SELECT 
USING (
  auth.uid() = id OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Only allow users to update their own non-sensitive fields
CREATE POLICY "Users can update own profile" 
ON public.user_profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id AND 
  role = (SELECT role FROM public.user_profiles WHERE id = auth.uid()) -- Prevent role escalation
);

-- Only admins can change roles
CREATE POLICY "Admin role management" 
ON public.user_profiles 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Prevent all profile deletions (keep existing protection)
CREATE POLICY "No profile deletions" 
ON public.user_profiles 
FOR DELETE 
USING (false);

-- Allow new user registration
CREATE POLICY "Users can create profile" 
ON public.user_profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- 3. Create a SAFE public view for user_profiles that excludes PII
CREATE OR REPLACE VIEW public.user_profiles_public AS
SELECT 
  id,
  username,
  avatar_url,
  rating,
  total_ganhaveis,
  created_at
  -- Excluding: full_name, bio, location, social_links, role, banned
FROM public.user_profiles
WHERE banned = false; -- Don't show banned users publicly

-- 4. Fix transactions table - ensure financial data is protected
-- Drop any overly permissive policies
DROP POLICY IF EXISTS "Admins can view all transactions" ON public.transactions;

-- Create secure transaction policies
CREATE POLICY "Secure transaction access" 
ON public.transactions 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 5. Ensure tickets are properly secured
-- Users can only see their own tickets or admins can see all
CREATE POLICY "Secure ticket access" 
ON public.tickets 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 6. Clean up duplicate raffle policies
DROP POLICY IF EXISTS "Public can view raffles" ON public.raffles;
DROP POLICY IF EXISTS "Allow all users to read raffles" ON public.raffles;
DROP POLICY IF EXISTS "Users can view public raffles" ON public.raffles;

-- Create single secure raffle policy
CREATE POLICY "Public raffle viewing" 
ON public.raffles 
FOR SELECT 
USING (
  status IN ('active', 'completed') OR 
  auth.uid() = user_id OR
  EXISTS (
    SELECT 1 FROM public.user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);