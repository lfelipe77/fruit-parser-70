-- Complete migration part 2: Handle subcategories and fix foreign key references

-- Step 1: Upsert subcategories using the new category structure
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

-- Step 2: Update existing raffles to map subcategory names to new UUIDs
UPDATE public.raffles 
SET subcategory_id = (
    SELECT s.id 
    FROM public.subcategories s 
    JOIN public.categories c ON s.category_id = c.id
    WHERE (lower(s.slug) = lower(raffles.subcategory) 
           OR lower(s.name) = lower(raffles.subcategory))
    AND c.id = raffles.category_id
    LIMIT 1
)
WHERE raffles.subcategory IS NOT NULL 
AND raffles.category_id IS NOT NULL
AND EXISTS (
    SELECT 1 FROM public.subcategories s 
    JOIN public.categories c ON s.category_id = c.id
    WHERE (lower(s.slug) = lower(raffles.subcategory) 
           OR lower(s.name) = lower(raffles.subcategory))
    AND c.id = raffles.category_id
);

-- Step 3: Clean up old data and create views
-- Clean up old ganhavel_categories that don't match our new taxonomy
WITH new_category_slugs AS (
    SELECT lower(slug) as slug FROM public.categories
)
DELETE FROM public.ganhavel_categories 
WHERE EXISTS (SELECT 1 FROM public.ganhavel_categories) 
AND lower(slug) NOT IN (SELECT slug FROM new_category_slugs);

-- Step 4: Create updated views that are compatible with the new schema
-- Drop and recreate category_stats view
DROP VIEW IF EXISTS public.category_stats CASCADE;
CREATE VIEW public.category_stats AS
SELECT 
    c.id,
    c.name,
    c.slug,
    c.icon_name,
    c.featured,
    c.sort_order,
    COALESCE(r.active_count, 0) as active_count,
    c.description as color_class,
    c.icon_name as icone_url
FROM public.categories c
LEFT JOIN (
    SELECT 
        category_id,
        COUNT(*) as active_count
    FROM public.raffles 
    WHERE status IN ('active', 'pending')
    GROUP BY category_id
) r ON c.id = r.category_id
ORDER BY c.sort_order, c.name;

-- Drop and recreate ganhavel_categories_public view
DROP VIEW IF EXISTS public.ganhavel_categories_public CASCADE;
CREATE VIEW public.ganhavel_categories_public AS
SELECT 
    row_number() OVER (ORDER BY c.sort_order, c.name)::bigint as id,
    c.name as nome,
    c.slug,
    c.description as descricao,
    c.icon_name as icone_url,
    c.featured as destaque,
    c.sort_order,
    COALESCE(r.active_raffles, 0) as active_raffles
FROM public.categories c
LEFT JOIN (
    SELECT 
        category_id,
        COUNT(*) as active_raffles
    FROM public.raffles 
    WHERE status IN ('active', 'pending')
    GROUP BY category_id
) r ON c.id = r.category_id
ORDER BY c.sort_order, c.name;

-- Create subcategories_public view
DROP VIEW IF EXISTS public.subcategories_public CASCADE;
CREATE VIEW public.subcategories_public AS
SELECT 
    s.id,
    s.category_id,
    c.name as category_nome,
    c.slug as category_slug,
    s.name as nome,
    s.slug,
    s.sort_order,
    COALESCE(r.active_raffles, 0) as active_raffles
FROM public.subcategories s
JOIN public.categories c ON s.category_id = c.id
LEFT JOIN (
    SELECT 
        subcategory_id,
        COUNT(*) as active_raffles
    FROM public.raffles 
    WHERE status IN ('active', 'pending')
    GROUP BY subcategory_id
) r ON s.id = r.subcategory_id
ORDER BY c.sort_order, s.sort_order, s.name;