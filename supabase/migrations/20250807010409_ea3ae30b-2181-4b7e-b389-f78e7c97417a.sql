-- Create security_alerts table if not exists
CREATE TABLE IF NOT EXISTS public.security_alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  type TEXT NOT NULL,
  description TEXT NOT NULL,
  ip_address TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- Create policy for admins to view all alerts
CREATE POLICY "Admins can view all security alerts" 
ON public.security_alerts 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Create policy for system to insert alerts
CREATE POLICY "System can insert security alerts" 
ON public.security_alerts 
FOR INSERT 
WITH CHECK (true);

-- Create function to send security notifications
CREATE OR REPLACE FUNCTION public.send_security_notification()
RETURNS TRIGGER AS $$
BEGIN
  -- Call edge function to send notifications
  PERFORM net.http_post(
    url := 'https://whqxpuyjxoiufzhvqneg.supabase.co/functions/v1/security-notifications',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndocXhwdXlqeG9pdWZ6aHZxbmVnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDE2NjI4MywiZXhwIjoyMDY5NzQyMjgzfQ.BM2u3x5Hq5QZ5F0u9l8D3pYr7jGNzBOyCNT7I6z8qL0"}'::jsonb,
    body := json_build_object(
      'type', NEW.type,
      'description', NEW.description,
      'ip_address', NEW.ip_address,
      'user_id', NEW.user_id,
      'created_at', NEW.created_at
    )::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to send notifications on new alerts
CREATE OR REPLACE TRIGGER security_alert_notification
  AFTER INSERT ON public.security_alerts
  FOR EACH ROW
  EXECUTE FUNCTION public.send_security_notification();