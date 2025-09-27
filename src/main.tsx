import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'
import './i18n'
import { AppErrorBoundary } from '@/components/AppErrorBoundary'
import { loadProductionScripts } from './utils/productionScripts'

// Debug kit for hard reload investigation
import { DebugOverlay } from '@/debug/DebugOverlay'
import { installNavigationDebug } from '@/debug/installNavigationDebug'

// --- EARLY OAUTH HANDLER (runs before router/guards) ---
import { supabase } from '@/integrations/supabase/client';

import { env } from '@/config/env';
import { log } from '@/utils/log';

// Debug blink diagnostics (preview only)
if (env.DEBUG_BLINK === 'true') {
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

  log.info('[oauth-early] href:', href, { hasCode, hasAT, cbHash: isHashCb, cbNonHash: isNonHashCb });
  log.info('[oauth-early] exchanging code/token before app boot…');

  try {
    if (hasAT && hasRT) {
      const access_token  = params.get('access_token')!;
      const refresh_token = params.get('refresh_token')!;
      const r = await supabase.auth.setSession({ access_token, refresh_token });
      log.debug('[oauth-early] setSession result', { error: r.error, user: r.data?.user?.id });
      if (r.error) throw r.error;

      // Double-check we actually have a session now
      const s = await supabase.auth.getSession();
      log.debug('[oauth-early] session after set', { hasSession: !!s.data.session });
    } else if (hasCode) {
      const r = await supabase.auth.exchangeCodeForSession(href);
      log.debug('[oauth-early] code exchange result', { error: r.error, user: r.data?.user?.id });
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
    log.error('[oauth-early] failed', e);
    history.replaceState(null, '', `${window.location.origin}/login`);
  }
}

// Install debug kit if enabled
if (env.DEBUG_HARDRELOAD === '1') {
  installNavigationDebug();
}

// Service Worker quick kill
if (typeof window !== 'undefined' && location.search.includes('nosw=1')) {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => registration.unregister());
      if ((window as any).__DEBUG_EVENTS) {
        (window as any).__DEBUG_EVENTS.push({
          ts: Date.now(),
          source: 'sw',
          detail: { event: 'unregister', count: registrations.length }
        });
      }
      console.log('[DebugKit] Unregistered', registrations.length, 'service workers due to ?nosw=1');
    });
  }
}

// Boot AFTER handling OAuth. Do not hard-redirect.
(async () => {
  log.info('[MAIN] Starting app boot...');
  log.debug('[MAIN] Current URL:', window.location.href);
  try {
    await oauthEarly();
    log.info('[MAIN] OAuth early completed, rendering app...');
    
    // Boot breadcrumb for debug
    if (typeof window !== 'undefined') {
      const { isDebug } = await import('./debug/flag');
      if (isDebug()) {
        (window as any).__DEBUG_EVENTS = (window as any).__DEBUG_EVENTS || [];
        (window as any).__DEBUG_EVENTS.push({
          ts: Date.now(),
          source: 'boot',
          detail: { href: location.href, timestamp: new Date().toISOString() }
        });
      }
    }
    
    // Load production scripts (GA, Lovable) only in production
    loadProductionScripts();
    
    // existing React render here (unchanged):
    createRoot(document.getElementById("root")!).render(
      <AppErrorBoundary>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </AppErrorBoundary>
    );
    log.info('[MAIN] App rendered successfully');
  } catch (error) {
    log.error('[MAIN] App boot failed:', error);
    document.body.innerHTML = `<div style="padding: 20px; color: red;">App failed to start: ${error}</div>`;
  }
})();
