-- Step 4: Create unique indexes on transactions (RETRY after global cleanup)
CREATE UNIQUE INDEX IF NOT EXISTS ux_transactions_provider_payment
  ON public.transactions (provider, provider_payment_id)
  WHERE provider IS NOT NULL AND provider_payment_id IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS ux_transactions_reservation_paid_once
  ON public.transactions (reservation_id)
  WHERE reservation_id IS NOT NULL AND status = 'paid';