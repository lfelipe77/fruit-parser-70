-- Taxonomy migration without changing ID types
-- 1) Ensure unique indexes (case-insensitive slug uniqueness)
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug_lower ON public.categories (lower(slug));
CREATE UNIQUE INDEX IF NOT EXISTS idx_subcategories_cat_slug_lower ON public.subcategories (category_id, lower(slug));

-- 2) Deduplicate categories (keep oldest by created_at per lower(slug), fallback per lower(nome))
WITH ranked AS (
  SELECT id, created_at, slug, nome,
         ROW_NUMBER() OVER (PARTITION BY lower(slug) ORDER BY created_at ASC, id ASC) AS r_slug,
         ROW_NUMBER() OVER (PARTITION BY lower(nome) ORDER BY created_at ASC, id ASC) AS r_name
  FROM public.categories
), keep AS (
  SELECT id FROM ranked WHERE r_slug = 1
  UNION
  SELECT r2.id FROM ranked r2
  WHERE r2.r_slug > 1 AND r2.r_name = 1
    AND lower(r2.nome) NOT IN (SELECT lower(nome) FROM ranked WHERE r_slug = 1)
)
DELETE FROM public.categories c WHERE EXISTS (
  SELECT 1 FROM public.categories c2 WHERE c2.id = c.id
) AND c.id NOT IN (SELECT id FROM keep);

-- 3) Deduplicate subcategories (keep oldest by created_at per (category_id, lower(slug)), fallback per (category_id, lower(name)))
WITH ranked_s AS (
  SELECT id, category_id, created_at, slug, name,
         ROW_NUMBER() OVER (PARTITION BY category_id, lower(slug) ORDER BY created_at ASC, id ASC) AS r_slug,
         ROW_NUMBER() OVER (PARTITION BY category_id, lower(name) ORDER BY created_at ASC, id ASC) AS r_name
  FROM public.subcategories
), keep_s AS (
  SELECT id FROM ranked_s WHERE r_slug = 1
  UNION
  SELECT s2.id FROM ranked_s s2
  WHERE s2.r_slug > 1 AND s2.r_name = 1
    AND (s2.category_id, lower(s2.name)) NOT IN (
      SELECT category_id, lower(name) FROM ranked_s WHERE r_slug = 1
    )
)
DELETE FROM public.subcategories s WHERE s.id NOT IN (SELECT id FROM keep_s);

-- 4) Upsert categories (update then insert)
WITH desired(slug,name,sort_order) AS (
  VALUES
    ('eletronicos','Eletrônicos',1),
    ('celulares-smartwatches','Celulares & Smartwatches',2),
    ('games-consoles','Games & Consoles',3),
    ('eletrodomesticos','Eletrodomésticos',4),
    ('gift-cards','Gift Cards',5),
    ('carros-motos','Carros & Motos',6),
    ('produtos-virais','Produtos Virais',7),
    ('diversos','Diversos',8)
)
UPDATE public.categories c
SET nome = d.name,
    sort_order = d.sort_order
FROM desired d
WHERE lower(c.slug) = lower(d.slug);

WITH desired(slug,name,sort_order) AS (
  VALUES
    ('eletronicos','Eletrônicos',1),
    ('celulares-smartwatches','Celulares & Smartwatches',2),
    ('games-consoles','Games & Consoles',3),
    ('eletrodomesticos','Eletrodomésticos',4),
    ('gift-cards','Gift Cards',5),
    ('carros-motos','Carros & Motos',6),
    ('produtos-virais','Produtos Virais',7),
    ('diversos','Diversos',8)
)
INSERT INTO public.categories (nome, slug, sort_order, destaque)
SELECT d.name, d.slug, d.sort_order, false
FROM desired d
LEFT JOIN public.categories c ON lower(c.slug) = lower(d.slug)
WHERE c.id IS NULL;

-- 5) Upsert subcategories (update then insert)
WITH cat_ids AS (
  SELECT id AS category_id, lower(slug) AS slug_lower FROM public.categories
), desired(cat_slug, name, slug, sort_order) AS (
  VALUES
    -- Eletrônicos
    ('eletronicos','TVs','tvs',1),
    ('eletronicos','Tablets','tablets',2),
    ('eletronicos','Notebooks','notebooks',3),
    ('eletronicos','Gadgets','gadgets',4),\
    ('eletronicos','Monitores','monitores',5),
    ('eletronicos','Câmeras & Drones','cameras-drones',6),
    -- Celulares & Smartwatches
    ('celulares-smartwatches','iPhone','iphone',1),
    ('celulares-smartwatches','Samsung','samsung',2),
    ('celulares-smartwatches','Xiaomi','xiaomi',3),
    ('celulares-smartwatches','Apple Watch / Smartwatches','smartwatches',4),
    ('celulares-smartwatches','Acessórios (capas, carregadores)','acessorios-mobile',5),
    ('celulares-smartwatches','Recondicionados','recondicionados',6),
    -- Games & Consoles
    ('games-consoles','PlayStation 5','ps5',1),
    ('games-consoles','Xbox','xbox',2),
    ('games-consoles','Nintendo Switch','switch',3),
    ('games-consoles','Jogos / Acessórios','jogos-acessorios',4),
    ('games-consoles','PC Gamer','pc-gamer',5),
    ('games-consoles','Realidade Virtual (VR)','vr',6),
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
UPDATE public.subcategories s
SET name = d.name,
    sort_order = d.sort_order
FROM desired d
JOIN cat_ids c ON c.slug_lower = lower(d.cat_slug)
WHERE s.category_id = c.category_id
  AND lower(s.slug) = lower(d.slug);

WITH cat_ids AS (
  SELECT id AS category_id, lower(slug) AS slug_lower FROM public.categories
), desired(cat_slug, name, slug, sort_order) AS (
  VALUES
    -- Eletrônicos
    ('eletronicos','TVs','tvs',1),
    ('eletronicos','Tablets','tablets',2),
    ('eletronicos','Notebooks','notebooks',3),
    ('eletronicos','Gadgets','gadgets',4),
    ('eletronicos','Monitores','monitores',5),
    ('eletronicos','Câmeras & Drones','cameras-drones',6),
    -- Celulares & Smartwatches
    ('celulares-smartwatches','iPhone','iphone',1),
    ('celulares-smartwatches','Samsung','samsung',2),
    ('celulares-smartwatches','Xiaomi','xiaomi',3),
    ('celulares-smartwatches','Apple Watch / Smartwatches','smartwatches',4),
    ('celulares-smartwatches','Acessórios (capas, carregadores)','acessorios-mobile',5),
    ('celulares-smartwatches','Recondicionados','recondicionados',6),
    -- Games & Consoles
    ('games-consoles','PlayStation 5','ps5',1),\
    ('games-consoles','Xbox','xbox',2),
    ('games-consoles','Nintendo Switch','switch',3),
    ('games-consoles','Jogos / Acessórios','jogos-acessorios',4),
    ('games-consoles','PC Gamer','pc-gamer',5),
    ('games-consoles','Realidade Virtual (VR)','vr',6),
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

-- 6) Repoint raffles by slug match (case-insensitive)
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

-- 7) Delete old categories/subcategories not in the new set and not referenced
WITH desired_c AS (
  SELECT unnest(ARRAY['eletronicos','celulares-smartwatches','games-consoles','eletrodomesticos','gift-cards','carros-motos','produtos-virais','diversos']) AS slug
)
DELETE FROM public.categories c
WHERE lower(c.slug) NOT IN (SELECT slug FROM desired_c)
  AND NOT EXISTS (SELECT 1 FROM public.subcategories s WHERE s.category_id = c.id)
  AND NOT EXISTS (SELECT 1 FROM public.raffles r WHERE r.category_id = c.id);

WITH desired_pairs AS (
  SELECT cat.id AS category_id, d.slug
  FROM public.categories cat
  JOIN (VALUES
    ('eletronicos','tvs'),('eletronicos','tablets'),('eletronicos','notebooks'),('eletronicos','gadgets'),('eletronicos','monitores'),('eletronicos','cameras-drones'),
    ('celulares-smartwatches','iphone'),('celulares-smartwatches','samsung'),('celulares-smartwatches','xiaomi'),('celulares-smartwatches','smartwatches'),('celulares-smartwatches','acessorios-mobile'),('celulares-smartwatches','recondicionados'),
    ('games-consoles','ps5'),('games-consoles','xbox'),('games-consoles','switch'),('games-consoles','jogos-acessorios'),('games-consoles','pc-gamer'),('games-consoles','vr'),
    ('eletrodomesticos','airfryer'),('eletrodomesticos','geladeira'),('eletrodomesticos','micro-ondas'),('eletrodomesticos','maquinas-lavar'),('eletrodomesticos','ar-condicionado'),('eletrodomesticos','purificadores-filtros'),
    ('gift-cards','amazon'),('gift-cards','ifood'),('gift-cards','google-play'),('gift-cards','rewarble'),('gift-cards','console-stores'),('gift-cards','streaming-music'),
    ('carros-motos','carros'),('carros-motos','motos'),('carros-motos','mini-luxo'),('carros-motos','eletricos'),('carros-motos','scooters-eletricas'),('carros-motos','auto-acessorios-servicos'),
    ('produtos-virais','led'),('produtos-virais','mini-projetor'),('produtos-virais','massageador'),('produtos-virais','tiktok-friendly'),('produtos-virais','mini-geladeira'),('produtos-virais','beauty-tech'),
    ('diversos','extravagantes'),('diversos','ineditos'),('diversos','influencer-booster'),('diversos','luxo-imoveis'),('diversos','colecionaveis'),('diversos','cursos-mentorias'),('diversos','outros')
  ) AS d(cat_slug, slug) ON lower(cat.slug) = lower(d.cat_slug)
)
DELETE FROM public.subcategories s
WHERE NOT EXISTS (
  SELECT 1 FROM desired_pairs dp
  WHERE dp.category_id = s.category_id AND lower(dp.slug) = lower(s.slug)
)
AND NOT EXISTS (SELECT 1 FROM public.raffles r WHERE r.subcategory_id = s.id);
