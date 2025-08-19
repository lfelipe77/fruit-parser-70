-- Fix participants_count to show actual unique participants
-- Let's first check the current view definition and then recreate it properly

CREATE OR REPLACE VIEW public.raffles_public_money_ext AS
WITH paid_status AS (
  SELECT unnest(array['paid'::text, 'settled'::text, 'confirmed'::text, 'approved'::text]) AS s
)
SELECT
  r.id,
  r.title,
  r.description,
  substring(regexp_replace(coalesce(r.description, ''), '\s+', ' ', 'g'), 1, 160) AS description_excerpt,
  r.image_url,
  r.status,
  r.ticket_price,
  r.goal_amount,
  r.created_at,
  r.draw_date,
  coalesce(rc.name, r.city) AS location_city,
  coalesce(r.state_uf::text, r.state) AS location_state,
  c.nome AS category_name,
  c.slug AS category_slug,
  sc.name AS subcategory_name,
  sc.slug AS subcategory_slug,
  r.direct_purchase_link,
  
  -- Money raised from paid transactions
  coalesce((
    SELECT sum(tr.amount)
    FROM public.transactions tr
    JOIN paid_status ps ON tr.status = ps.s
    WHERE tr.raffle_id = r.id
  ), 0::numeric) AS amount_raised,
  
  -- Last payment date
  (
    SELECT max(tr.created_at)
    FROM public.transactions tr
    JOIN paid_status ps ON tr.status = ps.s
    WHERE tr.raffle_id = r.id
  ) AS last_paid_at,

  -- FIXED: Count unique participants (distinct buyer_user_id) from paid transactions only
  coalesce((
    SELECT count(DISTINCT tr.buyer_user_id)
    FROM public.transactions tr
    JOIN paid_status ps ON tr.status = ps.s
    WHERE tr.raffle_id = r.id
    AND tr.buyer_user_id IS NOT NULL
  ), 0::bigint) AS participants_count,

  -- Progress percentage based on money
  CASE
    WHEN r.goal_amount > 0::numeric THEN
      least(
        100::numeric,
        greatest(
          0::numeric,
          round(
            coalesce((
              SELECT sum(tr.amount)
              FROM public.transactions tr
              JOIN paid_status ps ON tr.status = ps.s
              WHERE tr.raffle_id = r.id
            ), 0::numeric) / r.goal_amount * 100::numeric
          )
        )
      )
    ELSE 0::numeric
  END::integer AS progress_pct_money

FROM public.raffles r
LEFT JOIN public.categories c ON c.id = r.category_id
LEFT JOIN public.subcategories sc ON sc.id = r.subcategory_id
LEFT JOIN public.brazil_cities rc ON rc.id = r.city_id;