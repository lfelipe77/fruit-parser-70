-- Create the missing transaction and ticket for the Magic Chess Game purchase
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
  'aa3df0cd-022c-413b-af0c-e2079bf6d876',
  6.68,
  'paid',
  'asaas',
  'pay_e7wiv7ibx2if6yil',
  'dee6d607-d671-495a-99ca-f763c5e6dba8',
  '["58", "89", "06", "55", "23"]'::jsonb,
  '2025-09-06 11:48:47.601393-03'::timestamptz
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
  '09663659-4890-49f5-a951-c6418fefc3b4',
  '09663659-4890-49f5-a951-c6418fefc3b4',
  'aa3df0cd-022c-413b-af0c-e2079bf6d876',
  1,
  '["58", "89", "06", "55", "23"]'::jsonb,
  'paid',
  'dee6d607-d671-495a-99ca-f763c5e6dba8',
  '2025-09-06 11:48:47.601393-03'::timestamptz
);

-- Update the raffle amount raised
UPDATE public.raffles 
SET amount_raised = COALESCE(amount_raised, 0) + 6.68,
    sold_tickets = COALESCE(sold_tickets, 0) + 1
WHERE id = 'aa3df0cd-022c-413b-af0c-e2079bf6d876';