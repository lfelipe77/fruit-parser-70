import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'
import './i18n'
import { AppErrorBoundary } from '@/components/AppErrorBoundary'

// --- EARLY OAUTH HANDLER (runs before router/guards) ---
import { supabase } from '@/integrations/supabase/client';

// Debug blink diagnostics (preview only)
if (import.meta.env.VITE_DEBUG_BLINK === 'true') {
  import('./debugBlink');
}

function parseFragmentParams(href: string) {
  // OAuth callbacks may have hash fragments with tokens
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

    // Clean URL without reloading; restore to home instead of forcing dashboard
    const lastPath = sessionStorage.getItem("lastPath");
    const restoreTo = lastPath && lastPath !== "/login" && lastPath !== "/auth/callback" ? lastPath : "/";
    // Use clean URLs - no more hash routing
    const currentPath = `${window.location.origin}${restoreTo}`;
    if (window.location.href !== currentPath) {
      history.replaceState(null, '', currentPath);
    }
  } catch (e) {
    console.error('[oauth-early] failed', e);
    history.replaceState(null, '', `${window.location.origin}/login`);
  }
}

// Boot AFTER handling OAuth. Do not hard-redirect.
(async () => {
  console.log('[MAIN] Starting app boot...');
  console.log('[MAIN] Current URL:', window.location.href);
  try {
    await oauthEarly();
    console.log('[MAIN] OAuth early completed, rendering app...');
    // existing React render here (unchanged):
    createRoot(document.getElementById("root")!).render(
      <AppErrorBoundary>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </AppErrorBoundary>
    );
    console.log('[MAIN] App rendered successfully');
  } catch (error) {
    console.error('[MAIN] App boot failed:', error);
    document.body.innerHTML = `<div style="padding: 20px; color: red;">App failed to start: ${error}</div>`;
  }
})();
