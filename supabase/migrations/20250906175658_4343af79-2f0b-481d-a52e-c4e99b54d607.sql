-- Fix the lifecycle for "Teste Pro Working" raffle and improve the view logic

-- 1. Mark the funded raffle as 'funded' status
UPDATE public.raffles 
SET status = 'funded', 
    funded_at = now()
WHERE id = '2ba95877-45be-457b-9ac9-823a485c2545' 
  AND status = 'active';

-- 2. Assign next draw date (next Wed/Sat 8pm BRT)
UPDATE public.raffles r
SET status = 'drawing',
    draw_date = (
      -- Calculate next Wed (3) or Sat (6) at 20:00 BRT
      SELECT CASE 
        WHEN EXTRACT(dow FROM now() AT TIME ZONE 'America/Sao_Paulo') = 3 
             AND EXTRACT(hour FROM now() AT TIME ZONE 'America/Sao_Paulo') < 20 
        THEN 
          -- Today is Wednesday before 8pm
          date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo') + interval '20 hours'
        WHEN EXTRACT(dow FROM now() AT TIME ZONE 'America/Sao_Paulo') = 6 
             AND EXTRACT(hour FROM now() AT TIME ZONE 'America/Sao_Paulo') < 20 
        THEN 
          -- Today is Saturday before 8pm  
          date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo') + interval '20 hours'
        ELSE
          -- Find next Wednesday or Saturday
          CASE 
            WHEN EXTRACT(dow FROM now() AT TIME ZONE 'America/Sao_Paulo') IN (0,1,2) THEN
              -- Sun, Mon, Tue -> next Wednesday
              date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo') + 
              interval '20 hours' + 
              (3 - EXTRACT(dow FROM now() AT TIME ZONE 'America/Sao_Paulo')) * interval '1 day'
            WHEN EXTRACT(dow FROM now() AT TIME ZONE 'America/Sao_Paulo') = 3 THEN
              -- Wed after 8pm -> next Saturday  
              date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo') + 
              interval '20 hours' + interval '3 days'
            WHEN EXTRACT(dow FROM now() AT TIME ZONE 'America/Sao_Paulo') IN (4,5) THEN
              -- Thu, Fri -> next Saturday
              date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo') + 
              interval '20 hours' + 
              (6 - EXTRACT(dow FROM now() AT TIME ZONE 'America/Sao_Paulo')) * interval '1 day'
            ELSE
              -- Sat after 8pm -> next Wednesday
              date_trunc('day', now() AT TIME ZONE 'America/Sao_Paulo') + 
              interval '20 hours' + interval '4 days'
          END
      END AT TIME ZONE 'America/Sao_Paulo'
    )
WHERE id = '2ba95877-45be-457b-9ac9-823a485c2545' 
  AND status = 'funded';

-- 3. Fix the v_eligible_completed_raffles view to not exclude recent payments
-- The current view excludes raffles paid after the last federal draw, which is wrong
-- Recently completed raffles should still appear until they're processed
CREATE OR REPLACE VIEW public.v_eligible_completed_raffles AS
WITH latest AS (
  SELECT lottery_latest_federal_store.draw_date
  FROM lottery_latest_federal_store
  ORDER BY lottery_latest_federal_store.draw_date DESC
  LIMIT 1
), winners AS (
  SELECT DISTINCT v_federal_winners.raffle_id
  FROM v_federal_winners
)
SELECT 
  r.id,
  r.title,
  r.description,
  r.description_excerpt,
  r.image_url,
  r.status,
  r.ticket_price,
  r.goal_amount,
  r.created_at,
  r.draw_date,
  r.location_city,
  r.location_state,
  r.category_name,
  r.category_slug,
  r.subcategory_name,
  r.subcategory_slug,
  r.amount_raised,
  r.last_paid_at,
  r.participants_count,
  r.progress_pct_money,
  r.direct_purchase_link
FROM raffles_public_money_ext r
WHERE r.status IN ('funded', 'drawing')  -- Show funded/drawing raffles waiting for next draw
  AND r.progress_pct_money >= 100
  AND r.id NOT IN (SELECT raffle_id FROM winners WHERE raffle_id IS NOT NULL)  -- Exclude already won raffles
ORDER BY r.draw_date ASC NULLS LAST, r.last_paid_at DESC;