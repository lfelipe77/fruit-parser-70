-- Handle remaining duplicate reservations manually - mark extras as refunded except the first one
UPDATE public.transactions 
SET status = 'refunded'
WHERE id IN (
  SELECT id FROM (
    SELECT id, 
           ROW_NUMBER() OVER (PARTITION BY reservation_id ORDER BY created_at ASC) as rn
    FROM public.transactions 
    WHERE reservation_id = '612b37ec-9f57-4bf5-a7d4-bef67c8d5028' 
    AND status = 'paid'
  ) ranked 
  WHERE rn > 1
);

-- Now try the unique indexes again
CREATE UNIQUE INDEX IF NOT EXISTS ux_transactions_provider_payment
  ON public.transactions (provider, provider_payment_id)
  WHERE provider IS NOT NULL AND provider_payment_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_transactions_reservation_paid_once
  ON public.transactions (reservation_id)
  WHERE reservation_id IS NOT NULL AND status = 'paid';