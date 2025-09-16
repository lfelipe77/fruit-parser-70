-- Add slug column to raffles_public_money_ext view
DROP VIEW IF EXISTS public.raffles_public_money_ext CASCADE;

CREATE VIEW public.raffles_public_money_ext AS
WITH paid_status AS (
    SELECT unnest(ARRAY['paid'::text, 'settled'::text, 'confirmed'::text, 'approved'::text]) AS s
)
SELECT 
    r.id,
    r.slug,
    r.title,
    r.description,
    substring(regexp_replace(COALESCE(r.description, ''::text), '\s+'::text, ' '::text, 'g'::text), 1, 160) AS description_excerpt,
    r.image_url,
    r.status,
    r.ticket_price,
    r.goal_amount,
    r.created_at,
    r.draw_date,
    COALESCE(rc.name, r.city) AS location_city,
    COALESCE((r.state_uf)::text, r.state) AS location_state,
    c.nome AS category_name,
    c.slug AS category_slug,
    sc.name AS subcategory_name,
    sc.slug AS subcategory_slug,
    COALESCE((
        SELECT sum(tr.amount) 
        FROM transactions tr
        JOIN paid_status ps ON (tr.status = ps.s)
        WHERE tr.raffle_id = r.id
    ), 0::numeric) AS amount_raised,
    (
        SELECT max(tr.created_at) 
        FROM transactions tr
        JOIN paid_status ps ON (tr.status = ps.s)
        WHERE tr.raffle_id = r.id
    ) AS last_paid_at,
    COALESCE((
        SELECT count(DISTINCT tr.buyer_user_id) 
        FROM transactions tr
        JOIN paid_status ps ON (tr.status = ps.s)
        WHERE tr.raffle_id = r.id AND tr.buyer_user_id IS NOT NULL
    ), 0::bigint) AS participants_count,
    (
        CASE
            WHEN r.goal_amount > 0::numeric THEN 
                LEAST(100::numeric, GREATEST(0::numeric, round(((COALESCE((
                    SELECT sum(tr.amount) 
                    FROM transactions tr
                    JOIN paid_status ps ON (tr.status = ps.s)
                    WHERE tr.raffle_id = r.id
                ), 0::numeric) / r.goal_amount) * 100::numeric))))
            ELSE 0::numeric
        END
    )::integer AS progress_pct_money,
    r.direct_purchase_link
FROM raffles r
LEFT JOIN categories c ON c.id = r.category_id
LEFT JOIN subcategories sc ON sc.id = r.subcategory_id
LEFT JOIN brazil_cities rc ON rc.id = r.city_id;