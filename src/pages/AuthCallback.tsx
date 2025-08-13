import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function AuthCallback() {
  useEffect(() => {
    (async () => {
      try {
        await supabase.auth.getSession();
      } catch (e) {
        // ignore; if the session already exists, this can throw a benign error
      } finally {
        // send the user into the app (HashRouter)
        window.location.replace('/#/dashboard');
      }
    })();
  }, []);
  return <p>Conectando…</p>;
}