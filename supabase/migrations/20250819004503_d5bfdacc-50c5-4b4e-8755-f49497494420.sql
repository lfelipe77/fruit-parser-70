-- Fix subcategory uniqueness and complete the taxonomy migration
-- Remove global slug constraint from subcategories if it exists
DROP INDEX IF EXISTS public.subcategories_slug_key CASCADE;

-- Deduplicate subcategories properly first
WITH ranked AS (
  SELECT id, category_id, slug, name,
         ROW_NUMBER() OVER (
           PARTITION BY category_id, lower(slug) 
           ORDER BY created_at ASC, id ASC
         ) AS r
  FROM public.subcategories
)
DELETE FROM public.subcategories 
WHERE id IN (SELECT id FROM ranked WHERE r > 1);

-- Complete subcategories taxonomy
WITH cat_ids AS (
  SELECT id AS category_id, lower(slug) AS slug_lower FROM public.categories
), all_desired(cat_slug, name, slug, sort_order) AS (
  VALUES
    -- Eletrodomésticos
    ('eletrodomesticos','Air Fryer','airfryer',1),
    ('eletrodomesticos','Geladeira','geladeira',2),
    ('eletrodomesticos','Micro-ondas','micro-ondas',3),
    ('eletrodomesticos','Máquinas de Lavar','maquinas-lavar',4),
    ('eletrodomesticos','Climatização (Ar-Condicionado)','ar-condicionado',5),
    ('eletrodomesticos','Purificadores & Filtros','purificadores-filtros',6),
    -- Gift Cards
    ('gift-cards','Amazon','amazon',1),
    ('gift-cards','iFood','ifood',2),
    ('gift-cards','Google Play','google-play',3),
    ('gift-cards','Rewarble (Internacionais)','rewarble',4),
    ('gift-cards','PlayStation / Xbox Store','console-stores',5),
    ('gift-cards','Spotify / Deezer','streaming-music',6),
    -- Carros & Motos
    ('carros-motos','Carros','carros',1),
    ('carros-motos','Motos','motos',2),
    ('carros-motos','Mini Carros / Veículos de Luxo','mini-luxo',3),
    ('carros-motos','Veículos Elétricos','eletricos',4),
    ('carros-motos','Scooters Elétricas','scooters-eletricas',5),
    ('carros-motos','Acessórios & Serviços','auto-acessorios-servicos',6),
    -- Produtos Virais
    ('produtos-virais','LED','led',1),
    ('produtos-virais','Mini Projetor','mini-projetor',2),
    ('produtos-virais','Massageador','massageador',3),
    ('produtos-virais','Produtos TikTok-Friendly','tiktok-friendly',4),
    ('produtos-virais','Mini Geladeira','mini-geladeira',5),
    ('produtos-virais','Beauty Tech (escovas, secadores)','beauty-tech',6),
    -- Diversos
    ('diversos','Extravagantes','extravagantes',1),
    ('diversos','Inéditos','ineditos',2),
    ('diversos','Influencer Booster','influencer-booster',3),
    ('diversos','Luxo / Imóveis','luxo-imoveis',4),
    ('diversos','Colecionáveis','colecionaveis',5),
    ('diversos','Cursos & Mentorias','cursos-mentorias',6),
    ('diversos','Outros','outros',7)
)
INSERT INTO public.subcategories (category_id, name, slug, sort_order)
SELECT c.category_id, d.name, d.slug, d.sort_order
FROM all_desired d
JOIN cat_ids c ON c.slug_lower = lower(d.cat_slug)
WHERE NOT EXISTS (
  SELECT 1 FROM public.subcategories s 
  WHERE s.category_id = c.category_id 
  AND lower(s.slug) = lower(d.slug)
);

-- Final repoint of raffles
UPDATE public.raffles r
SET category_id = c.id
FROM public.categories c
WHERE r.category IS NOT NULL
  AND r.category_id IS NULL
  AND (lower(c.slug) = lower(r.category) OR lower(c.nome) = lower(r.category));

UPDATE public.raffles r
SET subcategory_id = s.id
FROM public.subcategories s
JOIN public.categories c ON c.id = s.category_id
WHERE r.subcategory IS NOT NULL
  AND r.subcategory_id IS NULL
  AND r.category_id = c.id
  AND (lower(s.slug) = lower(r.subcategory) OR lower(s.name) = lower(r.subcategory));