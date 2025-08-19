-- Final taxonomy migration fixing syntax errors
-- 1) Ensure unique indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_categories_slug_lower ON public.categories (lower(slug));
CREATE UNIQUE INDEX IF NOT EXISTS idx_subcategories_cat_slug_lower ON public.subcategories (category_id, lower(slug));

-- 2) Upsert categories
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

-- 3) Upsert subcategories part 1
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
    ('games-consoles','PlayStation 5','ps5',1),
    ('games-consoles','Xbox','xbox',2),
    ('games-consoles','Nintendo Switch','switch',3),
    ('games-consoles','Jogos / Acessórios','jogos-acessorios',4),
    ('games-consoles','PC Gamer','pc-gamer',5),
    ('games-consoles','Realidade Virtual (VR)','vr',6)
)
INSERT INTO public.subcategories (category_id, name, slug, sort_order)
SELECT c.category_id, d.name, d.slug, d.sort_order
FROM desired d
JOIN cat_ids c ON c.slug_lower = lower(d.cat_slug)
LEFT JOIN public.subcategories s 
  ON s.category_id = c.category_id AND lower(s.slug) = lower(d.slug)
WHERE s.id IS NULL;