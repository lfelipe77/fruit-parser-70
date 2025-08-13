import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');
      const error = urlParams.get('error');

      if (error) {
        console.error('OAuth error:', error);
        navigate('/#/login');
        return;
      }

      if (code) {
        try {
          const { data, error: sessionError } = await supabase.auth.exchangeCodeForSession(code);
          if (sessionError) throw sessionError;
          if (data.session) {
            // Optional: Ensure user_profile is created (trigger should handle this)
            console.log('Session created:', data.session);
          }
        } catch (err) {
          console.error('Session exchange error:', err);
          navigate('/#/login');
          return;
        }
      }

      // Redirect to dashboard with hash routing
      navigate('/#/dashboard');
    };

    handleCallback();
  }, [navigate]);

  return <p>Redirecionando para login...</p>;
}