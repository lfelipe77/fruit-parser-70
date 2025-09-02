-- Concurrent index build for hot/large tables
-- RUN MANUALLY via psql / Supabase CLI (must be outside a transaction)
-- Example: supabase db connect  # project: whqxpuyjxoiufzhvqneg

-- Optional: keep locks short but allow long build
SET lock_timeout = '2s';            -- fail fast if a DDL lock can’t be acquired
SET statement_timeout = '0';        -- no timeout for long index builds (adjust if desired)

-- Build the same partial index using CONCURRENTLY
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_raffles_user_ac_created
ON public.raffles (user_id, created_at DESC)
WHERE status IN ('active','completed');

-- Optional: update planner stats after creation
ANALYZE public.raffles (user_id, status, created_at);
