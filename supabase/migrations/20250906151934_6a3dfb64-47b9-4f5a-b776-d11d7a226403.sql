-- Update transactions.numbers to include all combos for two reservations
UPDATE public.transactions
SET numbers = '[["34","39","85","12","89"],["12","84","91","81","23"],["90","80","51","39","04"],["03","23","93","04","87"],["97","61","52","86","56"],["92","41","68","02","85"]]'::jsonb
WHERE reservation_id = '6e6e935e-a36e-4308-82eb-f9b2df50e2e8'
  AND provider_payment_id = 'pay_v2hml7xnte7z9wkp';

UPDATE public.transactions
SET numbers = '[["58","89","06","55","23"],["86","68","62","68","35"]]'::jsonb
WHERE reservation_id = 'dee6d607-d671-495a-99ca-f763c5e6dba8'
  AND provider_payment_id = 'pay_e7wiv7ibx2if6yil';