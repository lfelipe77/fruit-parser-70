-- Step 3: Replace the My Tickets view with paid-only + correct counting
DROP VIEW IF EXISTS public.my_tickets_ext_v6;

CREATE OR REPLACE VIEW public.my_tickets_ext_v6 AS
SELECT
  t.id                                 AS transaction_id,
  COALESCE(t.buyer_user_id, t.user_id) AS buyer_user_id,
  t.raffle_id,
  t.created_at                         AS purchase_date,
  t.status                             AS tx_status,
  t.amount                             AS value,
  t.numbers                            AS purchased_numbers,
  -- authoritative: count actually paid tickets for this tx; fallback to numbers length
  COALESCE(
    COUNT(k.id) FILTER (WHERE k.status='paid' AND k.transaction_id=t.id),
    JSONB_ARRAY_LENGTH(t.numbers)
  )::int                                AS ticket_count,
  r.title                               AS raffle_title,
  r.image_url                           AS raffle_image_url,
  ext.goal_amount,
  ext.amount_raised,
  ext.progress_pct_money,
  r.draw_date
FROM public.transactions t
JOIN public.raffles r ON r.id = t.raffle_id
JOIN public.raffles_public_money_ext ext ON ext.id = r.id
LEFT JOIN public.tickets k ON k.transaction_id = t.id
WHERE t.status = 'paid'
GROUP BY
  t.id, r.id, ext.goal_amount, ext.amount_raised, ext.progress_pct_money, r.draw_date;