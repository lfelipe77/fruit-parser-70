-- Step 1: First check and align the schema
-- Update existing categories table structure to match required schema
DO $$
BEGIN
    -- Check if categories table has 'nome' column and rename to 'name'
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'nome') THEN
        ALTER TABLE public.categories RENAME COLUMN nome TO name;
    END IF;
    
    -- Add missing columns if they don't exist
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'description') THEN
        ALTER TABLE public.categories ADD COLUMN description text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'icon_name') THEN
        ALTER TABLE public.categories ADD COLUMN icon_name text;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'featured') THEN
        ALTER TABLE public.categories ADD COLUMN featured boolean DEFAULT false;
    END IF;
    
    -- Check if categories uses bigint id and needs conversion
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'id' AND data_type = 'bigint') THEN
        -- We'll handle this case by creating a new UUID-based categories table
        DROP TABLE IF EXISTS public.categories_new CASCADE;
        CREATE TABLE public.categories_new (
            id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
            name text NOT NULL,
            slug text NOT NULL,
            description text,
            icon_name text,
            featured boolean DEFAULT false,
            sort_order integer DEFAULT 0,
            created_at timestamptz DEFAULT now()
        );
        
        -- Copy data from old table, converting bigint id to uuid
        INSERT INTO public.categories_new (name, slug, description, icon_name, featured, sort_order, created_at)
        SELECT 
            COALESCE(name, nome) as name,
            slug,
            COALESCE(description, descricao) as description,
            COALESCE(icon_name, icon_emoji) as icon_name,
            COALESCE(featured, destaque, false) as featured,
            COALESCE(sort_order, 0) as sort_order,
            COALESCE(created_at, now()) as created_at
        FROM public.categories;
        
        -- Drop old table and rename new one
        DROP TABLE public.categories CASCADE;
        ALTER TABLE public.categories_new RENAME TO categories;
    END IF;
END $$;

-- Step 2: Create subcategories table if it doesn't exist with proper structure
CREATE TABLE IF NOT EXISTS public.subcategories (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id uuid NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
    name text NOT NULL,
    slug text NOT NULL,
    sort_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- Step 3: Create unique indexes if not exists
CREATE UNIQUE INDEX IF NOT EXISTS categories_slug_key ON public.categories (lower(slug));
CREATE UNIQUE INDEX IF NOT EXISTS subcats_cat_slug_key ON public.subcategories (category_id, lower(slug));

-- Step 4: Deduplicate categories (keep oldest by created_at per lower(slug), fallback to lower(name))
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

-- Step 5: Upsert new taxonomy (categories first)
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

-- Step 6: Upsert subcategories
WITH category_ids AS (
    SELECT id, slug FROM public.categories
)
INSERT INTO public.subcategories (category_id, name, slug, sort_order)
SELECT c.id, s.name, s.slug, s.sort_order
FROM category_ids c
CROSS JOIN LATERAL (
    VALUES 
        -- Eletrônicos
        ('eletronicos', 'TVs', 'tvs', 1),
        ('eletronicos', 'Tablets', 'tablets', 2),
        ('eletronicos', 'Notebooks', 'notebooks', 3),
        ('eletronicos', 'Gadgets', 'gadgets', 4),
        ('eletronicos', 'Monitores', 'monitores', 5),
        ('eletronicos', 'Câmeras & Drones', 'cameras-drones', 6),
        -- Celulares & Smartwatches
        ('celulares-smartwatches', 'iPhone', 'iphone', 1),
        ('celulares-smartwatches', 'Samsung', 'samsung', 2),
        ('celulares-smartwatches', 'Xiaomi', 'xiaomi', 3),
        ('celulares-smartwatches', 'Apple Watch / Smartwatches', 'smartwatches', 4),
        ('celulares-smartwatches', 'Acessórios (capas, carregadores)', 'acessorios-mobile', 5),
        ('celulares-smartwatches', 'Recondicionados', 'recondicionados', 6),
        -- Games & Consoles
        ('games-consoles', 'PlayStation 5', 'ps5', 1),
        ('games-consoles', 'Xbox', 'xbox', 2),
        ('games-consoles', 'Nintendo Switch', 'switch', 3),
        ('games-consoles', 'Jogos / Acessórios', 'jogos-acessorios', 4),
        ('games-consoles', 'PC Gamer', 'pc-gamer', 5),
        ('games-consoles', 'Realidade Virtual (VR)', 'vr', 6),
        -- Eletrodomésticos
        ('eletrodomesticos', 'Air Fryer', 'airfryer', 1),
        ('eletrodomesticos', 'Geladeira', 'geladeira', 2),
        ('eletrodomesticos', 'Micro-ondas', 'micro-ondas', 3),
        ('eletrodomesticos', 'Máquinas de Lavar', 'maquinas-lavar', 4),
        ('eletrodomesticos', 'Climatização (Ar-Condicionado)', 'ar-condicionado', 5),
        ('eletrodomesticos', 'Purificadores & Filtros', 'purificadores-filtros', 6),
        -- Gift Cards
        ('gift-cards', 'Amazon', 'amazon', 1),
        ('gift-cards', 'iFood', 'ifood', 2),
        ('gift-cards', 'Google Play', 'google-play', 3),
        ('gift-cards', 'Rewarble (Internacionais)', 'rewarble', 4),
        ('gift-cards', 'PlayStation / Xbox Store', 'console-stores', 5),
        ('gift-cards', 'Spotify / Deezer', 'streaming-music', 6),
        -- Carros & Motos
        ('carros-motos', 'Carros', 'carros', 1),
        ('carros-motos', 'Motos', 'motos', 2),
        ('carros-motos', 'Mini Carros / Veículos de Luxo', 'mini-luxo', 3),
        ('carros-motos', 'Veículos Elétricos', 'eletricos', 4),
        ('carros-motos', 'Scooters Elétricas', 'scooters-eletricas', 5),
        ('carros-motos', 'Acessórios & Serviços', 'auto-acessorios-servicos', 6),
        -- Produtos Virais
        ('produtos-virais', 'LED', 'led', 1),
        ('produtos-virais', 'Mini Projetor', 'mini-projetor', 2),
        ('produtos-virais', 'Massageador', 'massageador', 3),
        ('produtos-virais', 'Produtos TikTok-Friendly', 'tiktok-friendly', 4),
        ('produtos-virais', 'Mini Geladeira', 'mini-geladeira', 5),
        ('produtos-virais', 'Beauty Tech (escovas, secadores)', 'beauty-tech', 6),
        -- Diversos
        ('diversos', 'Extravagantes', 'extravagantes', 1),
        ('diversos', 'Inéditos', 'ineditos', 2),
        ('diversos', 'Influencer Booster', 'influencer-booster', 3),
        ('diversos', 'Luxo / Imóveis', 'luxo-imoveis', 4),
        ('diversos', 'Colecionáveis', 'colecionaveis', 5),
        ('diversos', 'Cursos & Mentorias', 'cursos-mentorias', 6),
        ('diversos', 'Outros', 'outros', 7)
) AS s(cat_slug, name, slug, sort_order)
WHERE c.slug = s.cat_slug
ON CONFLICT (category_id, lower(slug)) DO UPDATE SET
    name = EXCLUDED.name,
    sort_order = EXCLUDED.sort_order;