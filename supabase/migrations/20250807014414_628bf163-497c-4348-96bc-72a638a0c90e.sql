-- Update get_admin_logs function
CREATE OR REPLACE FUNCTION public.get_admin_logs()
 RETURNS TABLE(id uuid, user_id uuid, action text, context jsonb, created_at timestamp with time zone)
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  -- Check if current user is admin
  IF NOT EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE user_profiles.id = auth.uid() AND user_profiles.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  SELECT id, user_id, action, context, created_at
  FROM admin_log_view
  ORDER BY created_at DESC;
$function$;

-- Update get_current_user_role function
CREATE OR REPLACE FUNCTION public.get_current_user_role(user_id uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
  SELECT role FROM user_profiles WHERE id = user_id;
$function$;

-- Update update_user_role function
CREATE OR REPLACE FUNCTION public.update_user_role(user_id uuid, new_role text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
  IF (SELECT role FROM user_profiles WHERE id = auth.uid()) = 'admin' THEN
    UPDATE user_profiles SET role = new_role WHERE id = user_id;
    INSERT INTO action_logs (user_id, action, details)
    VALUES (auth.uid(), 'role_update', format('Changed role of user %s to %s', user_id, new_role));
  ELSE
    RAISE EXCEPTION 'Only admins can update roles';
  END IF;
END;
$function$;

-- Update notify_security_alert function
CREATE OR REPLACE FUNCTION public.notify_security_alert()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
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
$function$;

-- Update should_log_visit function
CREATE OR REPLACE FUNCTION public.should_log_visit(visit_ip text, visit_url text)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path = 'public'
AS $function$
BEGIN
    -- Verifica se já existe visita do mesmo IP na mesma URL nos últimos 10 minutos
    RETURN NOT EXISTS (
        SELECT 1 FROM public_visits 
        WHERE ip_address = visit_ip 
        AND url = visit_url 
        AND created_at >= now() - interval '10 minutes'
    );
END;
$function$;

-- Update log_public_visit function
CREATE OR REPLACE FUNCTION public.log_public_visit(visit_ip text, visit_user_agent text DEFAULT NULL::text, visit_url text DEFAULT '/'::text, visit_referer text DEFAULT NULL::text, visit_country text DEFAULT NULL::text, visit_city text DEFAULT NULL::text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = 'public'
AS $function$
DECLARE
    visit_id UUID;
BEGIN
    -- Verifica se deve registrar
    IF NOT should_log_visit(visit_ip, visit_url) THEN
        RETURN NULL;
    END IF;
    
    -- Registra a visita
    INSERT INTO public_visits (
        ip_address, user_agent, url, referer, country, city
    ) VALUES (
        visit_ip, visit_user_agent, visit_url, visit_referer, visit_country, visit_city
    ) RETURNING id INTO visit_id;
    
    RETURN visit_id;
END;
$function$;