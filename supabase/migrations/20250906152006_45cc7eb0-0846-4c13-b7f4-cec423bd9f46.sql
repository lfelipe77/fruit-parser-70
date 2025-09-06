-- Backfill using JSONB combos to satisfy ck_tickets_numbers_5singles
-- 1) Make My Day Ganhavel (6 combos)
WITH combos AS (
  SELECT '[
    ["34","39","85","12","89"],
    ["12","84","91","81","23"],
    ["90","80","51","39","04"],
    ["03","23","93","04","87"],
    ["97","61","52","86","56"],
    ["92","41","68","02","85"]
  ]'::jsonb AS j
), up_tx AS (
  UPDATE public.transactions
     SET numbers = (SELECT j FROM combos)
   WHERE reservation_id = '6e6e935e-a36e-4308-82eb-f9b2df50e2e8'
     AND provider_payment_id = 'pay_v2hml7xnte7z9wkp'
  RETURNING id
)
INSERT INTO public.tickets (id, user_id, buyer_user_id, raffle_id, numbers, status, reservation_id, transaction_id, created_at)
SELECT gen_random_uuid(),
       '16fff918-2142-4583-99eb-758e1d0dc390',
       '16fff918-2142-4583-99eb-758e1d0dc390',
       '2a5b222e-9ba8-4e0d-9494-9b76c5a41134',
       elem,
       'paid',
       '6e6e935e-a36e-4308-82eb-f9b2df50e2e8',
       (SELECT id FROM up_tx LIMIT 1),
       now()
FROM combos, jsonb_array_elements(j) AS elem
WHERE NOT EXISTS (
  SELECT 1 FROM public.tickets t
   WHERE t.reservation_id = '6e6e935e-a36e-4308-82eb-f9b2df50e2e8'
     AND t.numbers = elem
     AND t.status IN ('paid','issued')
);

-- 2) The Magic Chess Game (2 combos)
WITH combos2 AS (
  SELECT '[
    ["58","89","06","55","23"],
    ["86","68","62","68","35"]
  ]'::jsonb AS j
), up_tx2 AS (
  UPDATE public.transactions
     SET numbers = (SELECT j FROM combos2)
   WHERE reservation_id = 'dee6d607-d671-495a-99ca-f763c5e6dba8'
     AND provider_payment_id = 'pay_e7wiv7ibx2if6yil'
  RETURNING id
)
INSERT INTO public.tickets (id, user_id, buyer_user_id, raffle_id, numbers, status, reservation_id, transaction_id, created_at)
SELECT gen_random_uuid(),
       '09663659-4890-49f5-a951-c6418fefc3b4',
       '09663659-4890-49f5-a951-c6418fefc3b4',
       'aa3df0cd-022c-413b-af0c-e2079bf6d876',
       elem,
       'paid',
       'dee6d607-d671-495a-99ca-f763c5e6dba8',
       (SELECT id FROM up_tx2 LIMIT 1),
       now()
FROM combos2, jsonb_array_elements(j) AS elem
WHERE NOT EXISTS (
  SELECT 1 FROM public.tickets t
   WHERE t.reservation_id = 'dee6d607-d671-495a-99ca-f763c5e6dba8'
     AND t.numbers = elem
     AND t.status IN ('paid','issued')
);