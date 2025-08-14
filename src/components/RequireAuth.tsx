import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const loc = useLocation();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!cancelled) {
        setHasSession(!!session);
        setReady(true);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  // Don't bounce while OAuth callback is in progress
  const isOAuthReturn = window.location.href.includes('code=') || window.location.href.includes('access_token=');

  if (!ready) return <div style={{padding:16}}>Guard: checking session…</div>;
  if (!hasSession && !isOAuthReturn) return <Navigate to="/login" replace />;

  return <>{children}</>;
}