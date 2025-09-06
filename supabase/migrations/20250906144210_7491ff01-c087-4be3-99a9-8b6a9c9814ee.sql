-- Manual completion for failed payment with pairs format
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
  '09663659-4890-49f5-a951-c6418fefc3b4',
  '09663659-4890-49f5-a951-c6418fefc3b4',
  'd83ebeff-511b-41cb-a1bf-08dc79d2f37e',
  3.19,
  'paid',
  'asaas',
  'pay_0mixmeppdr61spkt',
  '98b9b43d-1681-439e-9334-a7e982388d23',
  '["75", "41", "45", "47", "40"]'::jsonb,
  '2025-09-06 11:14:49.107088-03'::timestamptz
);

-- Insert ticket with 5-pairs format as required by the constraint
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
  '09663659-4890-49f5-a951-c6418fefc3b4',
  '09663659-4890-49f5-a951-c6418fefc3b4',
  'd83ebeff-511b-41cb-a1bf-08dc79d2f37e',
  1,
  '[["75","00"], ["41","00"], ["45","00"], ["47","00"], ["40","00"]]'::jsonb,
  'paid',
  '98b9b43d-1681-439e-9334-a7e982388d23',
  '2025-09-06 11:14:49.107088-03'::timestamptz
);