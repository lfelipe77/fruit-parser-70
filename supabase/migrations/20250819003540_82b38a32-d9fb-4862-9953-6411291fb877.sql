-- Step 1: Create the new categories table with UUID primary key
DROP TABLE IF EXISTS public.categories_uuid CASCADE;
CREATE TABLE public.categories_uuid (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name text NOT NULL,
    slug text NOT NULL,
    description text,
    icon_name text,
    featured boolean DEFAULT false,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Step 2: Copy existing data from old table to new table
INSERT INTO public.categories_uuid (name, slug, description, icon_name, featured, sort_order, created_at)
SELECT 
    nome as name,
    slug,
    descricao as description,
    COALESCE(icon_emoji, icone_url) as icon_name,
    COALESCE(destaque, false) as featured,
    COALESCE(sort_order, 0) as sort_order,
    COALESCE(created_at, now()) as created_at
FROM public.categories;

-- Step 3: Create mapping table for old category IDs to new UUIDs
CREATE TEMP TABLE category_id_mapping AS
SELECT 
    old_cat.id as old_id,
    new_cat.id as new_id,
    old_cat.slug
FROM public.categories old_cat
JOIN public.categories_uuid new_cat ON old_cat.slug = new_cat.slug;

-- Step 4: Create subcategories table
DROP TABLE IF EXISTS public.subcategories CASCADE;
CREATE TABLE public.subcategories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id uuid NOT NULL REFERENCES public.categories_uuid(id) ON DELETE CASCADE,
    name text NOT NULL,
    slug text NOT NULL,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Step 5: Update raffles table to use UUID category_id instead of bigint
-- First add new UUID column
ALTER TABLE public.raffles ADD COLUMN category_uuid uuid;

-- Map existing category_id values to new UUIDs
UPDATE public.raffles 
SET category_uuid = m.new_id
FROM category_id_mapping m
WHERE raffles.category_id = m.old_id;

-- Step 6: Drop old categories table and rename new one
DROP TABLE public.categories CASCADE;
ALTER TABLE public.categories_uuid RENAME TO categories;

-- Update raffles table to use the new column
ALTER TABLE public.raffles DROP COLUMN category_id;
ALTER TABLE public.raffles RENAME COLUMN category_uuid TO category_id;

-- Step 7: Create unique indexes
CREATE UNIQUE INDEX categories_slug_key ON public.categories (lower(slug));
CREATE UNIQUE INDEX subcats_cat_slug_key ON public.subcategories (category_id, lower(slug));

-- Step 8: Deduplicate categories (keep oldest by created_at per lower(slug), fallback to lower(name))
WITH ranked_categories AS (
    SELECT *,
           ROW_NUMBER() OVER (
               PARTITION BY lower(slug) 
               ORDER BY created_at ASC, id ASC
           ) as slug_rank,
           ROW_NUMBER() OVER (
               PARTITION BY lower(name) 
               ORDER BY created_at ASC, id ASC
           ) as name_rank
    FROM public.categories
),
categories_to_keep AS (
    SELECT id FROM ranked_categories WHERE slug_rank = 1
    UNION
    SELECT id FROM ranked_categories 
    WHERE slug_rank > 1 AND name_rank = 1 
    AND lower(name) NOT IN (
        SELECT lower(name) FROM ranked_categories WHERE slug_rank = 1
    )
)
DELETE FROM public.categories 
WHERE id NOT IN (SELECT id FROM categories_to_keep);

-- Step 9: Upsert new taxonomy (categories first)
INSERT INTO public.categories (name, slug, description, icon_name, featured, sort_order)
VALUES 
    ('Eletrônicos', 'eletronicos', NULL, NULL, false, 1),
    ('Celulares & Smartwatches', 'celulares-smartwatches', NULL, NULL, false, 2),
    ('Games & Consoles', 'games-consoles', NULL, NULL, false, 3),
    ('Eletrodomésticos', 'eletrodomesticos', NULL, NULL, false, 4),
    ('Gift Cards', 'gift-cards', NULL, NULL, false, 5),
    ('Carros & Motos', 'carros-motos', NULL, NULL, false, 6),
    ('Produtos Virais', 'produtos-virais', NULL, NULL, false, 7),
    ('Diversos', 'diversos', NULL, NULL, false, 8)
ON CONFLICT (lower(slug)) DO UPDATE SET
    name = EXCLUDED.name,
    sort_order = EXCLUDED.sort_order;