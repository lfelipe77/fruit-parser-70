-- Backfill multi-combo tickets and transaction numbers for recent reservations
-- 1) Make My Day Ganhavel (6 combos)
WITH combos AS (
  SELECT ARRAY[
    ARRAY['34','39','85','12','89']::text[],
    ARRAY['12','84','91','81','23']::text[],
    ARRAY['90','80','51','39','04']::text[],
    ARRAY['03','23','93','04','87']::text[],
    ARRAY['97','61','52','86','56']::text[],
    ARRAY['92','41','68','02','85']::text[]
  ] AS c
), up_tx AS (
  UPDATE public.transactions
     SET numbers = (SELECT to_jsonb(c) FROM combos)
   WHERE reservation_id = '6e6e935e-a36e-4308-82eb-f9b2df50e2e8'
     AND provider_payment_id = 'pay_v2hml7xnte7z9wkp'
  RETURNING id
)
INSERT INTO public.tickets (id, user_id, buyer_user_id, raffle_id, numbers, status, reservation_id, transaction_id, created_at)
SELECT gen_random_uuid(),
       '16fff918-2142-4583-99eb-758e1d0dc390',
       '16fff918-2142-4583-99eb-758e1d0dc390',
       '2a5b222e-9ba8-4e0d-9494-9b76c5a41134',
       to_jsonb(combo),
       'paid',
       '6e6e935e-a36e-4308-82eb-f9b2df50e2e8',
       (SELECT id FROM up_tx LIMIT 1),
       now()
FROM combos, unnest(c) WITH ORDINALITY AS x(combo, ord)
WHERE NOT EXISTS (
  SELECT 1 FROM public.tickets t
   WHERE t.reservation_id = '6e6e935e-a36e-4308-82eb-f9b2df50e2e8'
     AND t.numbers = to_jsonb(combo)
     AND t.status IN ('paid','issued')
);

-- 2) The Magic Chess Game (2 combos)
WITH combos2 AS (
  SELECT ARRAY[
    ARRAY['58','89','06','55','23']::text[],
    ARRAY['86','68','62','68','35']::text[]
  ] AS c
), up_tx2 AS (
  UPDATE public.transactions
     SET numbers = (SELECT to_jsonb(c) FROM combos2)
   WHERE reservation_id = 'dee6d607-d671-495a-99ca-f763c5e6dba8'
     AND provider_payment_id = 'pay_e7wiv7ibx2if6yil'
  RETURNING id
)
INSERT INTO public.tickets (id, user_id, buyer_user_id, raffle_id, numbers, status, reservation_id, transaction_id, created_at)
SELECT gen_random_uuid(),
       '09663659-4890-49f5-a951-c6418fefc3b4',
       '09663659-4890-49f5-a951-c6418fefc3b4',
       'aa3df0cd-022c-413b-af0c-e2079bf6d876',
       to_jsonb(combo),
       'paid',
       'dee6d607-d671-495a-99ca-f763c5e6dba8',
       (SELECT id FROM up_tx2 LIMIT 1),
       now()
FROM combos2, unnest(c) WITH ORDINALITY AS x(combo, ord)
WHERE NOT EXISTS (
  SELECT 1 FROM public.tickets t
   WHERE t.reservation_id = 'dee6d607-d671-495a-99ca-f763c5e6dba8'
     AND t.numbers = to_jsonb(combo)
     AND t.status IN ('paid','issued')
);