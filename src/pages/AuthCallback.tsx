import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function AuthCallback() {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Handle the OAuth callback with hash fragments
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Auth callback error:', error);
        }
        // Always redirect to dashboard via hash routing
        window.location.replace('/#/dashboard');
      } catch (error) {
        console.error('Auth callback error:', error);
        window.location.replace('/#/dashboard');
      }
    };

    handleAuthCallback();
  }, []);
  return <p>Conectando…</p>;
}