-- Safe replace raffles_public_money_ext preserving exact column order
CREATE OR REPLACE VIEW public.raffles_public_money_ext AS
WITH paid_status AS (
  SELECT unnest(array['paid'::text, 'settled'::text, 'confirmed'::text, 'approved'::text]) AS s
)
SELECT
  r.id,                                           -- 1 id
  r.title,                                        -- 2 title
  r.description,                                  -- 3 description
  substring(regexp_replace(coalesce(r.description, ''), '\s+', ' ', 'g'), 1, 160) AS description_excerpt, -- 4 description_excerpt
  r.image_url,                                    -- 5 image_url
  r.status,                                       -- 6 status
  r.ticket_price,                                 -- 7 ticket_price
  r.goal_amount,                                  -- 8 goal_amount
  r.created_at,                                   -- 9 created_at
  r.draw_date,                                    -- 10 draw_date
  coalesce(rc.name, r.city)               AS location_city,  -- 11 location_city
  coalesce(r.state_uf::text, r.state)     AS location_state, -- 12 location_state
  c.nome                                  AS category_name,  -- 13 category_name
  c.slug                                  AS category_slug,  -- 14 category_slug
  sc.name                                 AS subcategory_name, -- 15 subcategory_name
  sc.slug                                 AS subcategory_slug, -- 16 subcategory_slug
  coalesce((                                 -- 17 amount_raised
    SELECT sum(tr.amount)
    FROM public.transactions tr
    JOIN paid_status ps ON tr.status = ps.s
    WHERE tr.raffle_id = r.id
  ), 0::numeric) AS amount_raised,
  (
    SELECT max(tr.created_at)                   -- 18 last_paid_at
    FROM public.transactions tr
    JOIN paid_status ps ON tr.status = ps.s
    WHERE tr.raffle_id = r.id
  ) AS last_paid_at,
  coalesce((                                 -- 19 participants_count (UNIQUE buyers)
    SELECT count(DISTINCT tr.buyer_user_id)
    FROM public.transactions tr
    JOIN paid_status ps ON tr.status = ps.s
    WHERE tr.raffle_id = r.id
      AND tr.buyer_user_id IS NOT NULL
  ), 0::bigint) AS participants_count,
  (
    CASE                                          -- 20 progress_pct_money
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
    END
  )::integer AS progress_pct_money,
  r.direct_purchase_link                         -- 21 direct_purchase_link
FROM public.raffles r
LEFT JOIN public.categories    c  ON c.id  = r.category_id
LEFT JOIN public.subcategories sc ON sc.id = r.subcategory_id
LEFT JOIN public.brazil_cities rc ON rc.id = r.city_id;