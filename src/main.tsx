import React from 'react';
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'
import './i18n'
import { supabase } from '@/integrations/supabase/client';

function parseFragmentParams(href: string) {
  // HashRouter yields "/#/auth-callback#access_token=..."
  const parts = href.split('#');
  const fragment = parts.length >= 3 ? parts[2] : parts[1] || '';
  return new URLSearchParams(fragment);
}

async function oauthEarly() {
  const href = window.location.href;
  const isHashCb    = href.includes('/#/auth-callback');
  const isNonHashCb = href.includes('/auth/callback');
  if (!isHashCb && !isNonHashCb) return;

  const params      = parseFragmentParams(href);
  const hasAT       = params.has('access_token');
  const hasRT       = params.has('refresh_token');
  const hasCode     = href.includes('code=');

  console.log('[oauth-early] href:', href, { hasCode, hasAT, cbHash: isHashCb, cbNonHash: isNonHashCb });
  console.log('[oauth-early] exchanging code/token before app boot…');

  try {
    if (hasAT && hasRT) {
      const access_token  = params.get('access_token')!;
      const refresh_token = params.get('refresh_token')!;
      const r = await supabase.auth.setSession({ access_token, refresh_token });
      console.log('[oauth-early] setSession result', { error: r.error, user: r.data?.user?.id });
      if (r.error) throw r.error;

      // Double-check we actually have a session now
      const s = await supabase.auth.getSession();
      console.log('[oauth-early] session after set', { hasSession: !!s.data.session });
    } else if (hasCode) {
      const r = await supabase.auth.exchangeCodeForSession(href);
      console.log('[oauth-early] code exchange result', { error: r.error, user: r.data?.user?.id });
      if (r.error) throw r.error;
    }

    // Clean URL without reloading; then let React boot with the stored session.
    history.replaceState(null, '', `${window.location.origin}/#/dashboard`);
  } catch (e) {
    console.error('[oauth-early] failed', e);
    history.replaceState(null, '', `${window.location.origin}/#/login`);
  }
}

function ErrorBoundary({ children }: { children: React.ReactNode }) {
  const [err, setErr] = React.useState<Error | null>(null);
  
  React.useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      setErr(new Error(event.message));
    };
    
    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);
  
  if (err) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold">Algo deu errado</h1>
        <p className="mt-2 text-red-700">{err.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Recarregar página
        </button>
      </div>
    );
  }
  
  return (
    <React.Suspense fallback={<div className="p-6">Carregando…</div>}>
      {children}
    </React.Suspense>
  );
}

// Boot AFTER handling OAuth. Do not hard-redirect.
(async () => {
  console.log('[MAIN] Starting app boot...');
  try {
    await oauthEarly();
    console.log('[MAIN] OAuth early completed, rendering app...');
    
    createRoot(document.getElementById("root")!).render(
      <React.StrictMode>
        <ErrorBoundary>
          <HelmetProvider>
            <App />
          </HelmetProvider>
        </ErrorBoundary>
      </React.StrictMode>
    );
    console.log('[MAIN] App rendered successfully');
  } catch (error) {
    console.error('[MAIN] App boot failed:', error);
    document.body.innerHTML = `<div style="padding: 20px; color: red;">App failed to start: ${error}</div>`;
  }
})();
