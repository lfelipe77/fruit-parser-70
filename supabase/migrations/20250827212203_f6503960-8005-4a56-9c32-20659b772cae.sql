-- Step 4: Create unique indexes on transactions (run after cleanup to avoid constraint violations)

-- 4.1 Each external provider payment should be unique (CONCURRENTLY in production)
CREATE UNIQUE INDEX IF NOT EXISTS ux_transactions_provider_payment
  ON public.transactions (provider, provider_payment_id)
  WHERE provider IS NOT NULL AND provider_payment_id IS NOT NULL;

-- 4.2 One PAID transaction per reservation
CREATE UNIQUE INDEX IF NOT EXISTS ux_transactions_reservation_paid_once
  ON public.transactions (reservation_id)
  WHERE reservation_id IS NOT NULL AND status = 'paid';