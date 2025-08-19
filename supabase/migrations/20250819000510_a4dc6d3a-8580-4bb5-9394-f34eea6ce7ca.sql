-- Add missing RLS policies for subcategories to allow admin deletion and updates
CREATE POLICY "subcategories_admin_delete" 
ON public.subcategories 
FOR DELETE 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM user_profiles p 
  WHERE p.id = auth.uid() AND p.role = 'admin'
));

CREATE POLICY "subcategories_admin_update" 
ON public.subcategories 
FOR UPDATE 
TO authenticated 
USING (EXISTS (
  SELECT 1 FROM user_profiles p 
  WHERE p.id = auth.uid() AND p.role = 'admin'
))
WITH CHECK (EXISTS (
  SELECT 1 FROM user_profiles p 
  WHERE p.id = auth.uid() AND p.role = 'admin'
));

CREATE POLICY "subcategories_admin_insert" 
ON public.subcategories 
FOR INSERT 
TO authenticated 
WITH CHECK (EXISTS (
  SELECT 1 FROM user_profiles p 
  WHERE p.id = auth.uid() AND p.role = 'admin'
));