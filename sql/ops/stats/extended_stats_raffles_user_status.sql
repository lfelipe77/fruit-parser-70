-- Optional extended statistics to help the planner with user_id + status filtering
-- Safe to run any time; consider after creating/updating relevant indexes

-- Dependencies + most-common-values across (user_id, status)
CREATE STATISTICS IF NOT EXISTS stats_raffles_user_status (dependencies, mcv)
ON user_id, status FROM public.raffles;

-- Optional: refresh stats for better estimates
ANALYZE public.raffles (user_id, status);
