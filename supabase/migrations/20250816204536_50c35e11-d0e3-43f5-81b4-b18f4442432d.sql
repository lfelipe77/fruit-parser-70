-- Admin can read all raffles from base table
DROP POLICY IF EXISTS "admin can read all raffles" ON public.raffles;
CREATE POLICY "admin can read all raffles"
ON public.raffles FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
);

-- Admin can read categories for joins
CREATE POLICY IF NOT EXISTS "admin read categories"
ON public.categories FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
);

-- Admin can read subcategories for joins
CREATE POLICY IF NOT EXISTS "admin read subcategories"
ON public.subcategories FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles up
    WHERE up.id = auth.uid() AND up.role = 'admin'
  )
);