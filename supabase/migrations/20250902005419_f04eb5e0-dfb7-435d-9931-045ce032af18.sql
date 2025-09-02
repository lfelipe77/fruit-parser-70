-- Performance index for raffles queries  
CREATE INDEX IF NOT EXISTS idx_raffles_user_status_created 
ON public.raffles (user_id, status, created_at DESC);