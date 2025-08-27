-- Fix my_tickets_ext_v6 to only include paid transactions and use correct ticket counting
DROP VIEW IF EXISTS public.my_tickets_ext_v6;

CREATE VIEW public.my_tickets_ext_v6 AS
SELECT 
  t.raffle_id,
  t.buyer_user_id,
  tr.id as transaction_id,
  r.title as raffle_title,
  r.image_url as raffle_image_url,
  r.goal_amount,
  r.draw_date,
  tr.status as tx_status,
  MAX(tr.created_at) as purchase_date,
  -- Use COUNT(*) for accurate ticket counting, not sum(qty) which can overcount
  COUNT(*) as ticket_count,
  -- Aggregate all numbers from all tickets for this buyer+raffle
  jsonb_agg(t.numbers ORDER BY t.created_at) as purchased_numbers,
  -- Sum amounts from transactions (should match ticket_count * unit_price)
  SUM(tr.amount) as value,
  -- Calculate progress using coalesce for safety
  COALESCE(
    (SELECT SUM(tr2.amount) 
     FROM transactions tr2 
     WHERE tr2.raffle_id = r.id AND tr2.status = 'paid'), 0
  ) as amount_raised,
  -- Progress percentage calculation
  CASE 
    WHEN COALESCE(r.goal_amount, 0) > 0 
    THEN LEAST(100, (
      COALESCE(
        (SELECT SUM(tr2.amount) 
         FROM transactions tr2 
         WHERE tr2.raffle_id = r.id AND tr2.status = 'paid'), 0
      ) * 100.0 / r.goal_amount
    )::integer)
    ELSE 0 
  END as progress_pct_money
FROM tickets t
INNER JOIN transactions tr ON tr.id = t.transaction_id
INNER JOIN raffles r ON r.id = t.raffle_id
WHERE tr.status = 'paid'  -- CRITICAL: Only include paid transactions
GROUP BY t.raffle_id, t.buyer_user_id, tr.id, r.title, r.image_url, r.goal_amount, r.draw_date, tr.status;

-- Fix raffle publishing issue by ensuring active raffles are automatically published
UPDATE raffles 
SET published = true 
WHERE status = 'active' AND published = false;