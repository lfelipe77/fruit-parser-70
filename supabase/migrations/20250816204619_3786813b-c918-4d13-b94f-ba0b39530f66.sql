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
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'categories' 
    AND policyname = 'admin read categories'
  ) THEN
    CREATE POLICY "admin read categories"
    ON public.categories FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'
      )
    );
  END IF;
END
$$;

-- Admin can read subcategories for joins
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'subcategories' 
    AND policyname = 'admin read subcategories'
  ) THEN
    CREATE POLICY "admin read subcategories"
    ON public.subcategories FOR SELECT
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid() AND up.role = 'admin'
      )
    );
  END IF;
END
$$;