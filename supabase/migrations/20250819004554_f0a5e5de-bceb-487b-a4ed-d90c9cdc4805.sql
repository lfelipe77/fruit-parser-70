-- Drop constraint and complete taxonomy
-- Remove the constraint
ALTER TABLE public.subcategories DROP CONSTRAINT IF EXISTS subcategories_slug_key;

-- Complete the subcategories if they don't exist
WITH cat_ids AS (
  SELECT id AS category_id, slug FROM public.categories
), missing_subcats AS (
  SELECT 
    c.category_id,
    desired.name,
    desired.slug,
    desired.sort_order
  FROM cat_ids c
  CROSS JOIN (
    VALUES
      ('eletronicos','Air Fryer','airfryer',1),
      ('eletronicos','Geladeira','geladeira',2),
      ('eletronicos','Micro-ondas','micro-ondas',3),
      ('eletronicos','Máquinas de Lavar','maquinas-lavar',4),
      ('eletronicos','Climatização (Ar-Condicionado)','ar-condicionado',5),
      ('eletronicos','Purificadores & Filtros','purificadores-filtros',6),
      ('gift-cards','Amazon','amazon',1),
      ('gift-cards','iFood','ifood',2),
      ('gift-cards','Google Play','google-play',3),
      ('gift-cards','Rewarble (Internacionais)','rewarble',4),
      ('gift-cards','PlayStation / Xbox Store','console-stores',5),
      ('gift-cards','Spotify / Deezer','streaming-music',6),
      ('carros-motos','Carros','carros',1),
      ('carros-motos','Motos','motos',2),
      ('carros-motos','Mini Carros / Veículos de Luxo','mini-luxo',3),
      ('carros-motos','Veículos Elétricos','eletricos',4),
      ('carros-motos','Scooters Elétricas','scooters-eletricas',5),
      ('carros-motos','Acessórios & Serviços','auto-acessorios-servicos',6),
      ('produtos-virais','LED','led',1),
      ('produtos-virais','Mini Projetor','mini-projetor',2),
      ('produtos-virais','Massageador','massageador',3),
      ('produtos-virais','Produtos TikTok-Friendly','tiktok-friendly',4),
      ('produtos-virais','Mini Geladeira','mini-geladeira',5),
      ('produtos-virais','Beauty Tech (escovas, secadores)','beauty-tech',6),
      ('diversos','Extravagantes','extravagantes',1),
      ('diversos','Inéditos','ineditos',2),
      ('diversos','Influencer Booster','influencer-booster',3),
      ('diversos','Luxo / Imóveis','luxo-imoveis',4),
      ('diversos','Colecionáveis','colecionaveis',5),
      ('diversos','Cursos & Mentorias','cursos-mentorias',6),
      ('diversos','Outros','outros',7)
  ) AS desired(cat_slug, name, slug, sort_order)
  WHERE c.slug = desired.cat_slug
  AND NOT EXISTS (
    SELECT 1 FROM public.subcategories s 
    WHERE s.category_id = c.category_id 
    AND s.slug = desired.slug
  )
)
INSERT INTO public.subcategories (category_id, name, slug, sort_order)
SELECT category_id, name, slug, sort_order
FROM missing_subcats;