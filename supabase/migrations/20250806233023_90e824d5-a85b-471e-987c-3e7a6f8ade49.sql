-- Create rate_limit_attempts table for tracking API usage
CREATE TABLE IF NOT EXISTS public.rate_limit_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  action TEXT NOT NULL,
  identifier TEXT NOT NULL, -- IP address or user ID
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.rate_limit_attempts ENABLE ROW LEVEL SECURITY;

-- Create policies - only allow reading own attempts (for logged users) or system access
CREATE POLICY "Users can view their own rate limit attempts" 
ON public.rate_limit_attempts 
FOR SELECT 
USING (
  -- Allow if user is authenticated and identifier matches their ID
  (auth.uid() IS NOT NULL AND identifier = auth.uid()::text)
  OR 
  -- Allow service role access (for edge functions)
  (auth.role() = 'service_role')
);

-- Create policy for inserting (only service role can insert)
CREATE POLICY "Service role can insert rate limit attempts" 
ON public.rate_limit_attempts 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role');

-- Create policy for deleting old entries (only service role)
CREATE POLICY "Service role can delete rate limit attempts" 
ON public.rate_limit_attempts 
FOR DELETE 
USING (auth.role() = 'service_role');

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_rate_limit_attempts_action_identifier 
ON public.rate_limit_attempts(action, identifier);

CREATE INDEX IF NOT EXISTS idx_rate_limit_attempts_created_at 
ON public.rate_limit_attempts(created_at);