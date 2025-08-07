-- Criar função para enviar notificações de alertas de segurança
CREATE OR REPLACE FUNCTION public.notify_security_alert()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
    notification_payload jsonb;
BEGIN
    -- Preparar payload para notificação
    notification_payload := jsonb_build_object(
        'alert_id', NEW.id,
        'type', NEW.type,
        'description', NEW.description,
        'severity', NEW.severity,
        'ip_address', NEW.ip_address,
        'user_id', NEW.user_id,
        'context', NEW.context,
        'created_at', NEW.created_at
    );

    -- Chamar edge function para enviar notificações
    PERFORM
        net.http_post(
            url := (SELECT secret_value FROM vault.secrets WHERE secret_name = 'SUPABASE_URL' LIMIT 1) || '/functions/v1/security-notifications',
            headers := jsonb_build_object(
                'Content-Type', 'application/json',
                'Authorization', 'Bearer ' || (SELECT secret_value FROM vault.secrets WHERE secret_name = 'SUPABASE_SERVICE_ROLE_KEY' LIMIT 1)
            ),
            body := notification_payload
        );

    RETURN NEW;
EXCEPTION
    WHEN OTHERS THEN
        -- Log erro mas não bloquear insert
        INSERT INTO logs (user_id, action, context)
        VALUES (
            NULL,
            'notification_error',
            jsonb_build_object(
                'error', SQLERRM,
                'alert_id', NEW.id
            )
        );
        RETURN NEW;
END;
$$;

-- Criar trigger para notificações automáticas
CREATE TRIGGER security_alert_notification
    AFTER INSERT ON public.security_alerts
    FOR EACH ROW
    EXECUTE FUNCTION public.notify_security_alert();