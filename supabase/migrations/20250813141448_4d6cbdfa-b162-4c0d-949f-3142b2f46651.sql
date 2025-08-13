-- Update ganhavel_categories_public view to use security_invoker
DROP VIEW IF EXISTS public.ganhavel_categories_public;

CREATE VIEW public.ganhavel_categories_public 
WITH (security_invoker = true) AS
SELECT 
  id,
  nome,
  slug,
  icone_url,
  descricao,
  destaque
FROM public.ganhavel_categories
WHERE destaque = true;

-- Grant SELECT permission to anon role
GRANT SELECT ON public.ganhavel_categories_public TO anon;

-- Revoke SELECT from anon on lottery_results to require authentication
REVOKE SELECT ON public.lottery_results FROM anon;