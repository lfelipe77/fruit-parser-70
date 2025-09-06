-- Create the missing transaction and ticket for the Make My Day Ganhavel purchase
INSERT INTO public.transactions (
  id,
  user_id,
  buyer_user_id,
  raffle_id,
  amount,
  status,
  provider,
  provider_payment_id,
  reservation_id,
  numbers,
  created_at
) VALUES (
  gen_random_uuid(),
  '16fff918-2142-4583-99eb-758e1d0dc390',
  '16fff918-2142-4583-99eb-758e1d0dc390',
  '2a5b222e-9ba8-4e0d-9494-9b76c5a41134',
  6.66,
  'paid',
  'asaas',
  'pay_v2hml7xnte7z9wkp',
  '6e6e935e-a36e-4308-82eb-f9b2df50e2e8',
  '["34", "39", "85", "12", "89"]'::jsonb,
  '2025-09-06 12:00:12.292013-03'::timestamptz
);

INSERT INTO public.tickets (
  id,
  user_id,
  buyer_user_id,
  raffle_id,
  ticket_number,
  numbers,
  status,
  reservation_id,
  created_at
) VALUES (
  gen_random_uuid(),
  '16fff918-2142-4583-99eb-758e1d0dc390',
  '16fff918-2142-4583-99eb-758e1d0dc390',
  '2a5b222e-9ba8-4e0d-9494-9b76c5a41134',
  1,
  '["34", "39", "85", "12", "89"]'::jsonb,
  'paid',
  '6e6e935e-a36e-4308-82eb-f9b2df50e2e8',
  '2025-09-06 12:00:12.292013-03'::timestamptz
);