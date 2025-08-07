-- Criar tabela para alertas de segurança
CREATE TABLE public.security_alerts (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    type TEXT NOT NULL, -- 'login_abuse', 'raffle_spam', 'suspicious_action'
    description TEXT NOT NULL,
    ip_address TEXT,
    user_id UUID,
    context JSONB DEFAULT '{}',
    severity TEXT DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'investigated', 'resolved', 'dismissed')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    resolved_by UUID
);

-- Enable RLS
ALTER TABLE public.security_alerts ENABLE ROW LEVEL SECURITY;

-- Admins can view all alerts
CREATE POLICY "Admins can view all security alerts" 
ON public.security_alerts 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
));

-- Admins can update alerts (resolve, dismiss)
CREATE POLICY "Admins can update security alerts" 
ON public.security_alerts 
FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
));

-- System can insert alerts
CREATE POLICY "System can insert security alerts" 
ON public.security_alerts 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NOT NULL);

-- Create index for performance
CREATE INDEX idx_security_alerts_created_at ON public.security_alerts(created_at DESC);
CREATE INDEX idx_security_alerts_status ON public.security_alerts(status);
CREATE INDEX idx_security_alerts_type ON public.security_alerts(type);

-- Function to create security alert
CREATE OR REPLACE FUNCTION public.create_security_alert(
    alert_type TEXT,
    alert_description TEXT,
    alert_ip_address TEXT DEFAULT NULL,
    alert_user_id UUID DEFAULT NULL,
    alert_context JSONB DEFAULT '{}',
    alert_severity TEXT DEFAULT 'medium'
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    alert_id UUID;
BEGIN
    INSERT INTO public.security_alerts (
        type, description, ip_address, user_id, context, severity
    ) VALUES (
        alert_type, alert_description, alert_ip_address, alert_user_id, alert_context, alert_severity
    ) RETURNING id INTO alert_id;
    
    RETURN alert_id;
END;
$$;

-- Function to check for login abuse (more than 10 failures from same IP in 1 hour)
CREATE OR REPLACE FUNCTION public.check_login_abuse()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    abuse_record RECORD;
BEGIN
    -- Check for IPs with more than 10 login failures in last hour
    FOR abuse_record IN
        SELECT 
            ip_address,
            COUNT(*) as failure_count,
            MAX(created_at) as last_attempt
        FROM rate_limit_attempts 
        WHERE action = 'login_attempt' 
        AND created_at >= now() - interval '1 hour'
        AND ip_address IS NOT NULL
        GROUP BY ip_address
        HAVING COUNT(*) > 10
    LOOP
        -- Check if we already have an active alert for this IP in the last hour
        IF NOT EXISTS (
            SELECT 1 FROM security_alerts 
            WHERE type = 'login_abuse' 
            AND ip_address = abuse_record.ip_address 
            AND status = 'active'
            AND created_at >= now() - interval '1 hour'
        ) THEN
            -- Create new alert
            PERFORM create_security_alert(
                'login_abuse',
                format('IP %s has %s failed login attempts in the last hour', 
                       abuse_record.ip_address, abuse_record.failure_count),
                abuse_record.ip_address,
                NULL,
                jsonb_build_object(
                    'failure_count', abuse_record.failure_count,
                    'last_attempt', abuse_record.last_attempt,
                    'timeframe', '1 hour'
                ),
                'high'
            );
        END IF;
    END LOOP;
END;
$$;

-- Function to check for raffle spam (more than 5 raffles by same user in 30 minutes)
CREATE OR REPLACE FUNCTION public.check_raffle_spam()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    spam_record RECORD;
BEGIN
    -- Check for users creating more than 5 raffles in last 30 minutes
    FOR spam_record IN
        SELECT 
            user_id,
            COUNT(*) as raffle_count,
            MAX(created_at) as last_creation
        FROM raffles 
        WHERE created_at >= now() - interval '30 minutes'
        AND user_id IS NOT NULL
        GROUP BY user_id
        HAVING COUNT(*) > 5
    LOOP
        -- Check if we already have an active alert for this user in the last 30 minutes
        IF NOT EXISTS (
            SELECT 1 FROM security_alerts 
            WHERE type = 'raffle_spam' 
            AND user_id = spam_record.user_id 
            AND status = 'active'
            AND created_at >= now() - interval '30 minutes'
        ) THEN
            -- Create new alert
            PERFORM create_security_alert(
                'raffle_spam',
                format('User has created %s raffles in the last 30 minutes', 
                       spam_record.raffle_count),
                NULL,
                spam_record.user_id,
                jsonb_build_object(
                    'raffle_count', spam_record.raffle_count,
                    'last_creation', spam_record.last_creation,
                    'timeframe', '30 minutes'
                ),
                'medium'
            );
        END IF;
    END LOOP;
END;
$$;

-- Function to check for suspicious actions
CREATE OR REPLACE FUNCTION public.check_suspicious_actions()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    suspicious_record RECORD;
BEGIN
    -- Check for suspicious actions in admin_log_view
    FOR suspicious_record IN
        SELECT 
            user_id,
            action,
            created_at,
            context
        FROM admin_log_view 
        WHERE action IN ('delete_rare_data', 'admin_escalation', 'bulk_delete', 'role_change')
        AND created_at >= now() - interval '1 hour'
        ORDER BY created_at DESC
    LOOP
        -- Check if we already have an alert for this specific action
        IF NOT EXISTS (
            SELECT 1 FROM security_alerts 
            WHERE type = 'suspicious_action' 
            AND user_id = suspicious_record.user_id 
            AND context->>'action' = suspicious_record.action
            AND status = 'active'
            AND created_at >= now() - interval '1 hour'
        ) THEN
            -- Create new alert
            PERFORM create_security_alert(
                'suspicious_action',
                format('Suspicious action detected: %s by user', suspicious_record.action),
                NULL,
                suspicious_record.user_id,
                jsonb_build_object(
                    'action', suspicious_record.action,
                    'action_time', suspicious_record.created_at,
                    'original_context', suspicious_record.context
                ),
                CASE 
                    WHEN suspicious_record.action IN ('delete_rare_data', 'bulk_delete') THEN 'critical'
                    WHEN suspicious_record.action = 'admin_escalation' THEN 'high'
                    ELSE 'medium'
                END
            );
        END IF;
    END LOOP;
END;
$$;

-- Master function to run all security checks
CREATE OR REPLACE FUNCTION public.run_security_checks()
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
    PERFORM check_login_abuse();
    PERFORM check_raffle_spam();
    PERFORM check_suspicious_actions();
END;
$$;