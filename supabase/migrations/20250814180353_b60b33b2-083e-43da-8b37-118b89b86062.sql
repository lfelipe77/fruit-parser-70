-- 1) TRANSACTIONS: keep "amount" as the base ticket revenue (EXCLUDING fees).
-- Add explicit fee fields and a precomputed total.
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS fee_fixed numeric(12,2) DEFAULT 0,                 -- e.g. 2.00 for Asaas
  ADD COLUMN IF NOT EXISTS fee_pct numeric(6,4) DEFAULT 0,                    -- in [0..1], e.g. 0 for Asaas
  ADD COLUMN IF NOT EXISTS fee_amount numeric(12,2) DEFAULT 0;                -- computed percentage portion

-- Add total_amount as a generated column
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS total_amount_computed numeric(12,2) GENERATED ALWAYS AS 
    ((COALESCE(amount,0) + COALESCE(fee_fixed,0) + COALESCE(fee_amount,0))) STORED;

-- 2) PAYOUTS: single record per raffle when we settle (commission 2% of gross ticket revenue).
CREATE TABLE IF NOT EXISTS public.payouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  raffle_id uuid NOT NULL REFERENCES public.raffles(id) ON DELETE CASCADE,
  gross_amount numeric(12,2) NOT NULL,                 -- sum of paid ticket revenue (EXCL. fees)
  provider_fee_total numeric(12,2) NOT NULL DEFAULT 0, -- sum of fee_fixed+fee_amount over PAID tx
  commission_pct numeric(6,4) NOT NULL DEFAULT 0.02,   -- 2%
  commission_amount numeric(12,2) NOT NULL,            -- gross * commission_pct
  net_amount numeric(12,2) NOT NULL,                   -- gross - commission_amount
  settled_at timestamptz                               -- when actually paid out
);

CREATE INDEX IF NOT EXISTS idx_payouts_raffle ON public.payouts(raffle_id);

ALTER TABLE public.payouts ENABLE ROW LEVEL SECURITY;

-- Viewable by admin; creator can view own raffle's payout; others no.
DROP POLICY IF EXISTS "payouts_view_admin_or_owner" ON public.payouts;
CREATE POLICY "payouts_view_admin_or_owner"
ON public.payouts FOR SELECT TO authenticated
USING (
  is_admin(auth.uid())
  OR EXISTS (
    SELECT 1 FROM public.raffles r
    WHERE r.id = payouts.raffle_id AND r.user_id = auth.uid()
  )
);

-- 3) PUBLIC VIEW: keep progress based on ticket revenue only (EXCLUDES fees).
-- We already compute: goal_amount = total_tickets * ticket_price
-- amount_collected = paid_tickets * ticket_price (no fee included) → unchanged
CREATE OR REPLACE VIEW public.raffles_public AS
SELECT
  r.*,
  COALESCE(s.paid_tickets,0) as paid_tickets,
  (r.total_tickets - COALESCE(s.paid_tickets,0)) as tickets_remaining,
  (r.total_tickets * r.ticket_price)::numeric(12,2) as goal_amount,
  (COALESCE(s.paid_tickets,0) * r.ticket_price)::numeric(12,2) as amount_collected,
  CASE WHEN (r.total_tickets * r.ticket_price) > 0
       THEN round(100.0 * (COALESCE(s.paid_tickets,0) * r.ticket_price)
                  / (r.total_tickets * r.ticket_price), 2)
       ELSE 0 END as progress_pct
FROM public.raffles r
LEFT JOIN public.v_raffle_ticket_stats s ON s.raffle_id = r.id
WHERE r.status IN ('active','completed','scheduled','closed','delivered');

GRANT SELECT ON public.raffles_public TO anon, authenticated;

-- 4) RPC: finalize payout (compute totals & record a payout row, admin/owner only)
CREATE OR REPLACE FUNCTION public.finalize_payout(p_raffle_id uuid)
RETURNS uuid
LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_owner uuid;
  v_is_admin bool;
  v_gross numeric(12,2);
  v_fee_total numeric(12,2);
  v_comm_pct numeric(6,4) := 0.02;
  v_comm_amt numeric(12,2);
  v_net numeric(12,2);
  v_payout_id uuid;
BEGIN
  -- Auth
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'not authenticated';
  END IF;

  SELECT r.user_id INTO v_owner FROM public.raffles r WHERE r.id = p_raffle_id;
  IF v_owner IS NULL THEN
    RAISE EXCEPTION 'raffle not found';
  END IF;

  SELECT is_admin(auth.uid()) INTO v_is_admin;

  IF NOT v_is_admin AND v_owner <> auth.uid() THEN
    RAISE EXCEPTION 'not allowed';
  END IF;

  -- Gross ticket revenue (EXCLUDES fees): sum of "amount" on PAID tx for this raffle
  SELECT COALESCE(sum(t.amount),0) INTO v_gross
  FROM public.transactions t
  WHERE t.ganhavel_id = p_raffle_id AND t.status = 'paid';

  -- Sum of provider fees charged to buyers (fixed + pct) for reporting
  SELECT COALESCE(sum(COALESCE(t.fee_fixed,0) + COALESCE(t.fee_amount,0)),0) INTO v_fee_total
  FROM public.transactions t
  WHERE t.ganhavel_id = p_raffle_id AND t.status = 'paid';

  v_comm_amt := round(v_gross * v_comm_pct, 2);
  v_net := v_gross - v_comm_amt;

  INSERT INTO public.payouts(raffle_id, gross_amount, provider_fee_total, commission_pct, commission_amount, net_amount)
  VALUES (p_raffle_id, v_gross, v_fee_total, v_comm_pct, v_comm_amt, v_net)
  RETURNING id INTO v_payout_id;

  RETURN v_payout_id;
END$$;

GRANT EXECUTE ON FUNCTION public.finalize_payout(uuid) TO authenticated;