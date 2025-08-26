import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'
import './i18n'
import { AppErrorBoundary } from '@/components/AppErrorBoundary'

// --- EARLY OAUTH HANDLER (runs before router/guards) ---
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

    // Clean URL without reloading; restore to home instead of forcing dashboard
    const lastPath = sessionStorage.getItem("lastPath");
    const restoreTo = lastPath && lastPath !== "/login" && lastPath !== "/auth/callback" ? lastPath : "/";
    history.replaceState(null, '', `${window.location.origin}/#${restoreTo}`);
  } catch (e) {
    console.error('[oauth-early] failed', e);
    history.replaceState(null, '', `${window.location.origin}/#/login`);
  }
}

// Boot AFTER handling OAuth. Do not hard-redirect.
(async () => {
  console.log('[MAIN] Starting app boot...');
  console.log('[MAIN] Current URL:', window.location.href);
  console.log('[MAIN] Environment check:', {
    isDev: import.meta.env.DEV,
    mode: import.meta.env.MODE,
    supabaseUrl: !!import.meta.env.VITE_SUPABASE_URL
  });
  
  try {
    await oauthEarly();
    console.log('[MAIN] OAuth early completed, rendering app...');
    
    // Check if root element exists
    const rootElement = document.getElementById("root");
    if (!rootElement) {
      throw new Error('Root element not found');
    }
    console.log('[MAIN] Root element found, creating React root...');
    
    // existing React render here (unchanged):
    createRoot(rootElement).render(
      <AppErrorBoundary>
        <HelmetProvider>
          <App />
        </HelmetProvider>
      </AppErrorBoundary>
    );
    console.log('[MAIN] App rendered successfully');
  } catch (error) {
    console.error('[MAIN] App boot failed:', error);
    console.error('[MAIN] Error details:', {
      message: error?.message,
      stack: error?.stack,
      name: error?.name
    });
    
    const rootElement = document.getElementById("root");
    if (rootElement) {
      rootElement.innerHTML = `
        <div style="padding: 20px; max-width: 600px; margin: 0 auto; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
          <h1 style="color: #dc2626; margin-bottom: 16px;">⚠️ App Failed to Start</h1>
          <p style="margin-bottom: 12px;"><strong>Error:</strong> ${error?.message || 'Unknown error'}</p>
          <details style="margin-top: 16px;">
            <summary style="cursor: pointer; color: #6b7280;">Technical Details</summary>
            <pre style="background: #f3f4f6; padding: 12px; border-radius: 4px; overflow: auto; font-size: 12px; margin-top: 8px;">${error?.stack || 'No stack trace available'}</pre>
          </details>
          <button onclick="window.location.reload()" style="margin-top: 16px; padding: 8px 16px; background: #3b82f6; color: white; border: none; border-radius: 4px; cursor: pointer;">
            Reload Page
          </button>
        </div>
      `;
    } else {
      document.body.innerHTML = `<div style="padding: 20px; color: red;">Critical Error: Cannot find root element. App failed to start: ${error?.message || error}</div>`;
    }
  }
})();
