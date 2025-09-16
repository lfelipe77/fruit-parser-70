-- Add slug column to raffles_public_money_ext view
DROP VIEW IF EXISTS public.raffles_public_money_ext;

CREATE VIEW public.raffles_public_money_ext AS
SELECT 
    r.id,
    r.slug,
    r.title,
    r.description,
    LEFT(r.description, 150) AS description_excerpt,
    r.image_url,
    r.status,
    r.ticket_price,
    r.goal_amount,
    r.created_at,
    r.draw_date,
    r.location_city,
    r.location_state,
    c.nome AS category_name,
    c.slug AS category_slug,
    sc.nome AS subcategory_name,
    sc.slug AS subcategory_slug,
    COALESCE(progress.amount_raised, 0) AS amount_raised,
    progress.last_paid_at,
    COALESCE(progress.participants_count, 0) AS participants_count,
    COALESCE(
        CASE 
            WHEN r.goal_amount > 0 THEN 
                ROUND((COALESCE(progress.amount_raised, 0) / r.goal_amount * 100)::numeric, 0)::integer
            ELSE 0 
        END, 
        0
    ) AS progress_pct_money,
    r.direct_purchase_link
FROM public.raffles r
LEFT JOIN public.categories c ON r.category_id = c.id
LEFT JOIN public.subcategories sc ON r.subcategory_id = sc.id
LEFT JOIN (
    SELECT 
        t.raffle_id,
        SUM(t.amount) AS amount_raised,
        MAX(t.created_at) AS last_paid_at,
        COUNT(DISTINCT t.buyer_user_id) AS participants_count
    FROM public.transactions t
    WHERE t.status = 'paid'
    GROUP BY t.raffle_id
) progress ON r.id = progress.raffle_id
WHERE r.status IN ('active', 'funded', 'premiado', 'completed');