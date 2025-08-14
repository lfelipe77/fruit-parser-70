import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState('Finalizando login...');

  useEffect(() => {
    (async () => {
      try {
        // If the URL contains the OAuth code, exchange it for a session
        const url = window.location.href;
        if (url.includes('code=')) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(url);
          if (error) {
            console.error('[oauth] exchangeCodeForSession error', error);
            setMsg('Falha no login. Tente novamente.');
            setTimeout(() => navigate('/#/login'), 1500);
            return;
          }
          // success
          setMsg('Login concluído! Redirecionando...');
          setTimeout(() => navigate('/#/dashboard'), 500);
          return;
        }

        // No code found: just send to login
        navigate('/#/login');
      } catch (e) {
        console.warn('[oauth] unexpected', e);
        navigate('/#/login');
      }
    })();
  }, [navigate]);

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="text-sm text-muted-foreground">{msg}</div>
    </div>
  );
}