-- Add pix_qr_code_id column and index for polling
ALTER TABLE public.payments_pending
  ADD COLUMN IF NOT EXISTS pix_qr_code_id TEXT;

CREATE INDEX IF NOT EXISTS idx_payments_pending_pix_qr_code_id
  ON public.payments_pending (pix_qr_code_id);

-- Ensure uniqueness + fast lookups on payments_pending (using DO block for conditional constraint)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'payments_pending_reservation_id_key'
  ) THEN
    ALTER TABLE public.payments_pending
      ADD CONSTRAINT payments_pending_reservation_id_key UNIQUE (reservation_id);
  END IF;
END$$;

CREATE INDEX IF NOT EXISTS idx_payments_pending_reservation_status
  ON public.payments_pending (reservation_id, status);

-- Ensure tickets can store linkage + timestamp
ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS transaction_id UUID,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT now();

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tickets_transaction_id_fkey'
  ) THEN
    ALTER TABLE public.tickets
      ADD CONSTRAINT tickets_transaction_id_fkey
      FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE SET NULL;
  END IF;
END$$;

-- Recreate finalize_paid_purchase with nullable p_asaas_payment_id and buyer contact
CREATE OR REPLACE FUNCTION public.finalize_paid_purchase(
  p_reservation_id uuid,
  p_asaas_payment_id text DEFAULT NULL,
  p_customer_name text DEFAULT NULL,
  p_customer_phone text DEFAULT NULL,
  p_customer_cpf text DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO public
AS $function$
DECLARE
  v_reservation RECORD;
  v_raffle RECORD;
  v_total_amount NUMERIC;
  v_transaction_id UUID;
  v_numbers_json JSONB;
  v_lock_key BIGINT;
BEGIN
  v_lock_key := ('x' || substring(md5(p_reservation_id::text), 1, 15))::bit(60)::bigint;
  IF NOT pg_try_advisory_lock(v_lock_key) THEN
    RAISE EXCEPTION 'Another finalization is in progress for reservation %', p_reservation_id;
  END IF;
  BEGIN
    IF EXISTS (
      SELECT 1 FROM public.transactions
      WHERE reservation_id = p_reservation_id
         OR (p_asaas_payment_id IS NOT NULL AND provider_payment_id = p_asaas_payment_id)
    ) THEN
      PERFORM pg_advisory_unlock(v_lock_key);
      RETURN jsonb_build_object('ok', true, 'reason', 'already_finalized');
    END IF;

    SELECT
      t.reservation_id,
      t.raffle_id,
      t.user_id,
      array_agg(t.ticket_number ORDER BY t.ticket_number) AS ticket_numbers,
      COUNT(*) AS qty
    INTO v_reservation
    FROM public.tickets t
    WHERE t.reservation_id = p_reservation_id
      AND t.status = 'reserved'
    GROUP BY t.reservation_id, t.raffle_id, t.user_id;

    IF NOT FOUND THEN
      PERFORM pg_advisory_unlock(v_lock_key);
      RAISE EXCEPTION 'Reservation not found or already processed: %', p_reservation_id;
    END IF;

    SELECT id, ticket_price INTO v_raffle
    FROM public.raffles
    WHERE id = v_reservation.raffle_id;
    IF NOT FOUND THEN
      PERFORM pg_advisory_unlock(v_lock_key);
      RAISE EXCEPTION 'Raffle not found: %', v_reservation.raffle_id;
    END IF;

    v_total_amount := COALESCE(v_raffle.ticket_price, 0) * v_reservation.qty;
    v_numbers_json := to_jsonb(v_reservation.ticket_numbers);

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
      customer_name,
      customer_phone,
      customer_cpf,
      created_at
    ) VALUES (
      gen_random_uuid(),
      v_reservation.user_id,
      v_reservation.user_id,
      v_reservation.raffle_id,
      v_total_amount,
      'paid',
      'asaas',
      COALESCE(p_asaas_payment_id, 'STATIC_PIX'),
      p_reservation_id,
      v_numbers_json,
      p_customer_name,
      p_customer_phone,
      p_customer_cpf,
      now()
    ) RETURNING id INTO v_transaction_id;

    UPDATE public.tickets
    SET status = 'paid',
        transaction_id = v_transaction_id,
        updated_at = now()
    WHERE reservation_id = p_reservation_id
      AND status = 'reserved';

   UPDATE public.payments_pending
    SET status = 'PAID',
        updated_at = now()
    WHERE reservation_id = p_reservation_id;

    PERFORM pg_advisory_unlock(v_lock_key);
    RETURN jsonb_build_object(
      'ok', true,
      'transaction_id', v_transaction_id,
      'reservation_id', p_reservation_id,
      'raffle_id', v_reservation.raffle_id,
      'qty', v_reservation.qty,
      'amount', v_total_amount,
      'ticket_numbers', v_numbers_json
    );
  EXCEPTION WHEN OTHERS THEN
    PERFORM pg_advisory_unlock(v_lock_key);
    RAISE;
  END;
END;
$function$;

GRANT EXECUTE ON FUNCTION public.finalize_paid_purchase(uuid, text, text, text, text) TO authenticated;