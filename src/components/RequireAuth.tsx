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
      if (!cancelled) setHasSession(!!session), setReady(true);
    })();

    const { data: sub } = supabase.auth.onAuthStateChange((_evt, session) => {
      setHasSession(!!session);
      setReady(true);
    });

    return () => { cancelled = true; sub.subscription?.unsubscribe(); };
  }, []);

  const isOAuthReturn = window.location.href.includes('auth-callback') || window.location.href.includes('code=');

  if (!ready || isOAuthReturn) {
    return <div style={{ padding: 16 }}>Guard: checking session…</div>;
  }

  if (!hasSession) return <Navigate to="/login" replace />;
  return <>{children}</>;
}