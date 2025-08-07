-- Criar tabela para registrar visitas públicas
CREATE TABLE public.public_visits (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    url TEXT NOT NULL,
    referer TEXT,
    country TEXT,
    city TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.public_visits ENABLE ROW LEVEL SECURITY;

-- Apenas admins podem ver as visitas
CREATE POLICY "Admins can view all public visits" 
ON public.public_visits 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM user_profiles 
    WHERE id = auth.uid() AND role = 'admin'
));

-- System/Edge Function pode inserir visitas
CREATE POLICY "System can insert public visits" 
ON public.public_visits 
FOR INSERT 
WITH CHECK (auth.role() = 'service_role' OR auth.uid() IS NULL);

-- Criar índices para performance
CREATE INDEX idx_public_visits_created_at ON public.public_visits(created_at DESC);
CREATE INDEX idx_public_visits_ip_url ON public.public_visits(ip_address, url);
CREATE INDEX idx_public_visits_url ON public.public_visits(url);

-- Function para verificar se deve registrar visita (evitar spam - 1 por 10 min)
CREATE OR REPLACE FUNCTION public.should_log_visit(
    visit_ip TEXT,
    visit_url TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
    -- Verifica se já existe visita do mesmo IP na mesma URL nos últimos 10 minutos
    RETURN NOT EXISTS (
        SELECT 1 FROM public_visits 
        WHERE ip_address = visit_ip 
        AND url = visit_url 
        AND created_at >= now() - interval '10 minutes'
    );
END;
$$;

-- Function para registrar visita
CREATE OR REPLACE FUNCTION public.log_public_visit(
    visit_ip TEXT,
    visit_user_agent TEXT DEFAULT NULL,
    visit_url TEXT DEFAULT '/',
    visit_referer TEXT DEFAULT NULL,
    visit_country TEXT DEFAULT NULL,
    visit_city TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
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
$$;