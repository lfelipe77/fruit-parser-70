-- Create table for rate limiting attempts
CREATE TABLE IF NOT EXISTS public.rate_limit_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  identifier TEXT NOT NULL, -- IP address, user ID, etc.
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on rate_limit_attempts table
ALTER TABLE public.rate_limit_attempts ENABLE ROW LEVEL SECURITY;

-- Create policy for system/service to insert rate limit attempts
CREATE POLICY "System can insert rate limit attempts" 
ON public.rate_limit_attempts 
FOR INSERT 
WITH CHECK (true);

-- Create policy for system/service to read rate limit attempts
CREATE POLICY "System can read rate limit attempts" 
ON public.rate_limit_attempts 
FOR SELECT 
USING (true);

-- Create policy for system/service to delete old rate limit attempts
CREATE POLICY "System can delete old rate limit attempts" 
ON public.rate_limit_attempts 
FOR DELETE 
USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_rate_limit_action_identifier 
ON public.rate_limit_attempts (action, identifier);

CREATE INDEX IF NOT EXISTS idx_rate_limit_created_at 
ON public.rate_limit_attempts (created_at);

-- Create composite index for efficient rate limit queries
CREATE INDEX IF NOT EXISTS idx_rate_limit_lookup 
ON public.rate_limit_attempts (action, identifier, created_at DESC);