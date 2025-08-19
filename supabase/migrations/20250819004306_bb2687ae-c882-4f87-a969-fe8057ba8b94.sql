-- Complete subcategories and repoint raffles

-- Upsert remaining subcategories
WITH cat_ids AS (
  SELECT id AS category_id, lower(slug) AS slug_lower FROM public.categories
), desired(cat_slug, name, slug, sort_order) AS (
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
-- update existing
UPDATE public.subcategories s
SET name = d.name,
    sort_order = d.sort_order
FROM desired d
JOIN cat_ids c ON c.slug_lower = lower(d.cat_slug)
WHERE s.category_id = c.category_id
  AND lower(s.slug) = lower(d.slug);

-- insert missing
WITH cat_ids AS (
  SELECT id AS category_id, lower(slug) AS slug_lower FROM public.categories
), desired(cat_slug, name, slug, sort_order) AS (
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
FROM desired d
JOIN cat_ids c ON c.slug_lower = lower(d.cat_slug)
LEFT JOIN public.subcategories s 
  ON s.category_id = c.category_id AND lower(s.slug) = lower(d.slug)
WHERE s.id IS NULL;

-- Repoint raffles
UPDATE public.raffles r
SET category_id = c.id
FROM public.categories c
WHERE r.category IS NOT NULL
  AND (lower(c.slug) = lower(r.category) OR lower(c.nome) = lower(r.category));

UPDATE public.raffles r
SET subcategory_id = s.id
FROM public.subcategories s
JOIN public.categories c ON c.id = s.category_id
WHERE r.subcategory IS NOT NULL
  AND r.category_id = c.id
  AND (lower(s.slug) = lower(r.subcategory) OR lower(s.name) = lower(r.subcategory));