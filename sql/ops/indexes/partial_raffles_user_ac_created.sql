-- Partial index for raffles by user (active+completed), ordered by newest first
-- Migration-safe (no CONCURRENTLY). Use inside migrations or any transaction block.
-- Supports queries filtering by user_id and status IN ('active','completed')
-- and ordering by created_at DESC.

CREATE INDEX IF NOT EXISTS idx_raffles_user_ac_created
ON public.raffles (user_id, created_at DESC)
WHERE status IN ('active','completed');

COMMENT ON INDEX idx_raffles_user_ac_created IS 'Partial index on raffles for (user_id, created_at DESC) where status in (active,completed)';
