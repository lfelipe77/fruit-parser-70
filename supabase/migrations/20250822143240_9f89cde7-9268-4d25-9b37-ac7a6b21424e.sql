-- Extend existing raffle_winner_logs to match edge function usage
-- 1) Ensure required columns exist with proper types/defaults
ALTER TABLE public.raffle_winner_logs
  ADD COLUMN IF NOT EXISTS numbers text[] DEFAULT '{}'::text[],
  ADD COLUMN IF NOT EXISTS fetched_url text,
  ADD COLUMN IF NOT EXISTS provider text,
  ADD COLUMN IF NOT EXISTS winners jsonb,
  ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

-- 2) Coerce numbers to text[] and enforce NOT NULL + default
DO $$
DECLARE
  v_udt text;
BEGIN
  -- Ensure the numbers column is text[]
  SELECT udt_name INTO v_udt
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'raffle_winner_logs'
    AND column_name = 'numbers';

  IF v_udt IS NOT NULL AND v_udt <> '_text' THEN
    ALTER TABLE public.raffle_winner_logs
      ALTER COLUMN numbers TYPE text[]
      USING (
        CASE
          WHEN numbers IS NULL THEN '{}'::text[]
          ELSE (
            -- Attempt to cast each element to text if it's another array type
            SELECT array_agg((elem)::text)
            FROM unnest(numbers) AS elem
          )
        END
      );
  END IF;

  -- Ensure non-null and default
  UPDATE public.raffle_winner_logs
  SET numbers = '{}'::text[]
  WHERE numbers IS NULL;

  ALTER TABLE public.raffle_winner_logs
    ALTER COLUMN numbers SET DEFAULT '{}'::text[];
  ALTER TABLE public.raffle_winner_logs
    ALTER COLUMN numbers SET NOT NULL;
END $$;

-- 3) Ensure request_id column exists as uuid (convert if currently text/varchar)
DO $$
DECLARE
  v_exists boolean;
  v_udt text;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='raffle_winner_logs' AND column_name='request_id'
  ) INTO v_exists;

  IF NOT v_exists THEN
    ALTER TABLE public.raffle_winner_logs ADD COLUMN request_id uuid;
  ELSE
    SELECT udt_name INTO v_udt
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='raffle_winner_logs' AND column_name='request_id';

    IF v_udt <> 'uuid' THEN
      -- Convert to uuid where possible, else NULL
      ALTER TABLE public.raffle_winner_logs
        ALTER COLUMN request_id TYPE uuid
        USING NULLIF(request_id::text, '')::uuid;
    END IF;
  END IF;
END $$;

-- 4) Create the requested index
CREATE INDEX IF NOT EXISTS idx_raffle_winner_logs_game_date
  ON public.raffle_winner_logs (game_slug, draw_date DESC);
