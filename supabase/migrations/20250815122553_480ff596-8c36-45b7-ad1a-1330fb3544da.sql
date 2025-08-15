-- Enable RLS on subcategories table
ALTER TABLE public.subcategories ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for subcategories table
DROP POLICY IF EXISTS "public_read_subcategories" ON public.subcategories;
CREATE POLICY "public_read_subcategories" 
ON public.subcategories FOR SELECT
TO anon, authenticated
USING (true);

-- Create RLS policies for categories table (if not exists)
DROP POLICY IF EXISTS "public_read_categories" ON public.categories;
CREATE POLICY "public_read_categories"
ON public.categories FOR SELECT 
TO anon, authenticated
USING (true);