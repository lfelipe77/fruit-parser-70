-- Create subcategories table
CREATE TABLE IF NOT EXISTS public.subcategories (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  category_id bigint NOT NULL,
  name text NOT NULL,
  slug text NOT NULL UNIQUE,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE CASCADE
);

-- Add subcategory_id column to raffles table
ALTER TABLE public.raffles 
ADD COLUMN IF NOT EXISTS subcategory_id uuid;

-- Add foreign key constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_raffles_subcategory'
  ) THEN
    ALTER TABLE public.raffles 
    ADD CONSTRAINT fk_raffles_subcategory 
    FOREIGN KEY (subcategory_id) REFERENCES public.subcategories(id);
  END IF;
END $$;

-- Create category_stats view
DROP VIEW IF EXISTS public.category_stats;
CREATE OR REPLACE VIEW public.category_stats AS
SELECT
  c.id,
  c.nome as name,
  c.slug,
  c.icone_url as icon_name,
  NULL::text as color_class,
  c.destaque as featured,
  COALESCE(c.sort_order, 0) as sort_order,
  COUNT(r.id) as ganhavel_count
FROM public.categories c
LEFT JOIN public.raffles r 
  ON r.category_id = c.id 
  AND r.status IN ('active', 'approved', 'scheduled', 'completed')
GROUP BY c.id, c.nome, c.slug, c.icone_url, c.destaque, COALESCE(c.sort_order, 0)
ORDER BY c.destaque DESC, COALESCE(c.sort_order, 0), c.nome;

-- Create subcategory_stats view  
DROP VIEW IF EXISTS public.subcategory_stats;
CREATE OR REPLACE VIEW public.subcategory_stats AS
SELECT
  s.id,
  s.category_id,
  s.name,
  s.slug,
  COALESCE(s.sort_order, 0) AS sort_order,
  COUNT(r.id) AS ganhavel_count
FROM public.subcategories s
LEFT JOIN public.raffles r
  ON r.subcategory_id = s.id
 AND r.status IN ('active', 'approved', 'scheduled', 'completed')
GROUP BY s.id, s.category_id, s.name, s.slug, COALESCE(s.sort_order, 0)
ORDER BY COALESCE(s.sort_order, 0), s.name;