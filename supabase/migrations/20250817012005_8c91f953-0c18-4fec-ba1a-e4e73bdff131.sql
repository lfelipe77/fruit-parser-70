-- Add missing columns to transactions table
ALTER TABLE public.transactions
  ADD COLUMN IF NOT EXISTS raffle_id uuid,
  ADD COLUMN IF NOT EXISTS buyer_user_id uuid,
  ADD COLUMN IF NOT EXISTS amount numeric(12,2),
  ADD COLUMN IF NOT EXISTS status text,
  ADD COLUMN IF NOT EXISTS provider text,
  ADD COLUMN IF NOT EXISTS provider_ref text,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Add missing columns to tickets table  
ALTER TABLE public.tickets
  ADD COLUMN IF NOT EXISTS raffle_id uuid,
  ADD COLUMN IF NOT EXISTS buyer_user_id uuid,
  ADD COLUMN IF NOT EXISTS qty int,
  ADD COLUMN IF NOT EXISTS unit_price numeric(12,2),
  ADD COLUMN IF NOT EXISTS numbers jsonb,
  ADD COLUMN IF NOT EXISTS transaction_id uuid,
  ADD COLUMN IF NOT EXISTS status text DEFAULT 'issued',
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- Create unique index for idempotency
CREATE UNIQUE INDEX IF NOT EXISTS ux_transactions_provider_ref
  ON public.transactions (provider_ref);

-- Add foreign key constraint if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'tickets_transaction_id_fkey'
  ) THEN
    ALTER TABLE public.tickets
      ADD CONSTRAINT tickets_transaction_id_fkey
      FOREIGN KEY (transaction_id) REFERENCES public.transactions(id) ON DELETE SET NULL;
  END IF;
END $$;

-- RLS policies for transactions
CREATE POLICY IF NOT EXISTS "tx_insert_own" ON public.transactions
FOR INSERT TO authenticated
WITH CHECK (buyer_user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "tx_select_own" ON public.transactions
FOR SELECT TO authenticated
USING (buyer_user_id = auth.uid());

-- RLS policies for tickets
CREATE POLICY IF NOT EXISTS "tk_insert_own" ON public.tickets
FOR INSERT TO authenticated
WITH CHECK (buyer_user_id = auth.uid());

CREATE POLICY IF NOT EXISTS "tk_select_own" ON public.tickets
FOR SELECT TO authenticated
USING (buyer_user_id = auth.uid());

-- Update views for money calculations
DROP VIEW IF EXISTS public.raffles_public_money_ext CASCADE;
DROP VIEW IF EXISTS public.raffles_money_view;

CREATE VIEW public.raffles_money_view AS
SELECT
  r.id as raffle_id,
  COALESCE(SUM(tx.amount) FILTER (WHERE tx.status='approved'), 0)::numeric(12,2) as amount_raised,
  COALESCE(r.goal_amount, 0)::numeric(12,2) as goal_amount,
  (
    CASE WHEN COALESCE(r.goal_amount,0) > 0
      THEN LEAST(100, ROUND(100 * COALESCE(SUM(tx.amount) FILTER (WHERE tx.status='approved'),0) / r.goal_amount))
      ELSE 0
    END
  )::int as progress_pct_money,
  MAX(CASE WHEN tx.status='approved' THEN tx.created_at END) as last_paid_at
FROM public.raffles r
LEFT JOIN public.transactions tx ON tx.raffle_id = r.id
GROUP BY r.id, r.goal_amount;

-- Recreate public view
CREATE VIEW public.raffles_public_money_ext AS
SELECT
  r.id, r.title, r.description, r.image_url, r.status, r.ticket_price, r.draw_date, r.created_at,
  c.nome as category_name, s.name as subcategory_name,
  m.amount_raised, m.goal_amount, m.progress_pct_money, m.last_paid_at
FROM public.raffles r
LEFT JOIN public.categories c ON c.id = r.category_id
LEFT JOIN public.subcategories s ON s.id = r.subcategory_id
LEFT JOIN public.raffles_money_view m ON m.raffle_id = r.id
WHERE r.status = 'active';

-- Create idempotent RPC function
CREATE OR REPLACE FUNCTION public.record_mock_purchase(
  p_raffle_id uuid,
  p_qty int,
  p_unit_price numeric,
  p_numbers jsonb,
  p_provider_ref text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_tx_id uuid;
  v_amount numeric := p_qty * p_unit_price;
BEGIN
  -- Check if user is authenticated
  IF v_user IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;

  -- 1) Upsert transaction by provider_ref (idempotent)
  INSERT INTO public.transactions (id, raffle_id, buyer_user_id, amount, status, provider, provider_ref)
  VALUES (gen_random_uuid(), p_raffle_id, v_user, v_amount, 'approved', 'mock', p_provider_ref)
  ON CONFLICT (provider_ref) DO UPDATE
    SET updated_at = now()
  RETURNING id INTO v_tx_id;

  -- 2) Insert tickets only if they don't exist for this transaction
  IF NOT EXISTS (
    SELECT 1 FROM public.tickets tk
    WHERE tk.transaction_id = v_tx_id
  ) THEN
    INSERT INTO public.tickets (raffle_id, buyer_user_id, qty, unit_price, numbers, transaction_id, status)
    VALUES (p_raffle_id, v_user, p_qty, p_unit_price, p_numbers, v_tx_id, 'issued');
  END IF;

  RETURN v_tx_id;
END $$;