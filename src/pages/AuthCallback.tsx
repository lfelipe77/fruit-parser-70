import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [msg, setMsg] = useState('Finalizando login...');

  useEffect(() => {
    (async () => {
      try {
        console.log('[AuthCallback] Starting OAuth callback process');
        console.log('[AuthCallback] Current URL:', window.location.href);
        
        // If the URL contains the OAuth code, exchange it for a session
        const url = window.location.href;
        if (url.includes('code=')) {
          console.log('[AuthCallback] OAuth code found, exchanging for session');
          const { data, error } = await supabase.auth.exchangeCodeForSession(url);
          if (error) {
            console.error('[oauth] exchangeCodeForSession error', error);
            setMsg('Falha no login. Tente novamente.');
            setTimeout(() => navigate('/login'), 1500);
            return;
          }
          // success
          console.log('[AuthCallback] Session exchange successful, navigating to intended destination');
          setMsg('Login concluído! Redirecionando...');
          setTimeout(() => {
            const urlParams = new URLSearchParams(window.location.search);
            const redirectTo = urlParams.get('redirectTo');
            const destination = redirectTo ? decodeURIComponent(redirectTo) : '/';
            navigate(destination, { replace: true });
          }, 500);
          return;
        }

        // No code found: just send to login
        console.log('[AuthCallback] No OAuth code found, redirecting to login');
        navigate('/login');
      } catch (e) {
        console.warn('[oauth] unexpected', e);
        navigate('/login');
      }
    })();
  }, [navigate]);

  return (
    <div className="w-full h-screen flex items-center justify-center">
      <div className="text-sm text-muted-foreground">{msg}</div>
    </div>
  );
}