-- Colunas para o ciclo da rifa
ALTER TABLE public.raffles
  ADD COLUMN IF NOT EXISTS funded_at timestamptz,
  ADD COLUMN IF NOT EXISTS draw_source text,
  ADD COLUMN IF NOT EXISTS draw_ref text,
  ADD COLUMN IF NOT EXISTS winning_numbers jsonb,
  ADD COLUMN IF NOT EXISTS winners jsonb,
  ADD COLUMN IF NOT EXISTS completed_at timestamptz;

-- Tabela para sorteios oficiais (ex.: Caixa)
CREATE TABLE IF NOT EXISTS public.lottery_draws (
  id bigserial primary key,
  source text not null,              -- ex.: 'caixa'
  draw_ref text not null unique,     -- número/concurso
  draw_date timestamptz not null,
  result_json jsonb                  -- números oficiais quando sairem
);

-- Índices simples
CREATE INDEX IF NOT EXISTS idx_lottery_draws_date ON public.lottery_draws(draw_date);
CREATE INDEX IF NOT EXISTS idx_raffles_status ON public.raffles(status);

-- Atualizar view pública para incluir created_at
DROP VIEW IF EXISTS public.raffles_public_money_ext;

CREATE VIEW public.raffles_public_money_ext AS
SELECT
  r.id,
  r.title,
  r.description,
  r.image_url,
  r.status,
  r.ticket_price,
  r.draw_date,
  r.created_at,                  -- incluído
  c.nome as category_name,
  s.name as subcategory_name,
  coalesce(m.amount_raised, 0) as amount_raised,
  coalesce(m.goal_amount, 0) as goal_amount,
  least(greatest(coalesce(m.progress_pct_money, 0), 0), 100) as progress_pct_money,
  m.last_paid_at
FROM public.raffles r
LEFT JOIN public.categories c    ON c.id = r.category_id
LEFT JOIN public.subcategories s ON s.id = r.subcategory_id
LEFT JOIN public.raffles_money_view m ON m.raffle_id = r.id
WHERE r.status = 'active';

-- RPC helpers para transições de status

-- Marcar como FUNDED quando atingir 100%
CREATE OR REPLACE FUNCTION public.job_mark_funded()
RETURNS void LANGUAGE sql AS $$
  UPDATE public.raffles r
  SET status = 'funded',
      funded_at = now()
  FROM public.raffles_money_view m
  WHERE m.raffle_id = r.id
    AND r.status = 'active'
    AND coalesce(m.progress_pct_money,0) >= 100
    AND r.funded_at IS NULL;
$$;

-- Atribuir próximo sorteio para rifas FUNDED (sem draw_date)
CREATE OR REPLACE FUNCTION public.job_assign_next_draw()
RETURNS void LANGUAGE sql AS $$
  WITH next_draw AS (
    SELECT ld.source, ld.draw_ref, ld.draw_date
    FROM public.lottery_draws ld
    WHERE ld.draw_date > now()
    ORDER BY ld.draw_date ASC
    LIMIT 1
  )
  UPDATE public.raffles r
  SET status = 'drawing',
      draw_source = (SELECT source FROM next_draw),
      draw_ref    = (SELECT draw_ref  FROM next_draw),
      draw_date   = (SELECT draw_date FROM next_draw)
  WHERE r.status = 'funded'
    AND r.draw_date IS NULL
    AND EXISTS (SELECT 1 FROM next_draw);
$$;

-- Fechar sorteios (quando já há resultado oficial)
CREATE OR REPLACE FUNCTION public.job_close_draws()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.raffles r
  SET status = 'completed',
      winning_numbers = ld.result_json,
      winners = coalesce(r.winners, '[]'::jsonb), -- placeholder
      completed_at = now()
  FROM public.lottery_draws ld
  WHERE r.status = 'drawing'
    AND r.draw_source = ld.source
    AND r.draw_ref = ld.draw_ref
    AND ld.result_json IS NOT NULL
    AND coalesce(r.completed_at, to_timestamp(0)) < now();
END;
$$;