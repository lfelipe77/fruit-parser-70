import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'
import './i18n'

// --- EARLY OAUTH HANDLER (runs before router/guards) ---
import { supabase } from '@/integrations/supabase/client';

(function earlyOAuth() {
  try {
    const href = window.location.href;

    // Detect a callback on either /auth/callback?code=... or #/auth-callback?code=...
    const isNonHashCb = href.includes('/auth/callback') && href.includes('code=');
    const isHashCb    = href.includes('#/auth-callback') && href.includes('code=');

    if (!isNonHashCb && !isHashCb) return; // nothing to do

    console.log('[oauth] early handler: detected callback', { href });

    // Exchange *before* rendering the app, to avoid guard races
    supabase.auth.exchangeCodeForSession(href)
      .then(({ data, error }) => {
        if (error) {
          console.error('[oauth] exchange error', error);
          // If exchange failed, send to login
          window.location.replace(`${window.location.origin}/#/login`);
          return;
        }
        console.log('[oauth] exchange success', { user: data?.user?.id });
        // Send user to dashboard (hash or non-hash dashboard both acceptable if route exists)
        window.location.replace(`${window.location.origin}/#/dashboard`);
      })
      .catch((e) => {
        console.warn('[oauth] exchange threw', e);
        window.location.replace(`${window.location.origin}/#/login`);
      });

    // IMPORTANT: prevent the rest of the app from booting under the callback URL
    // The page will navigate after exchange.
    throw new Error('STOP_BOOTSTRAP_UNTIL_OAUTH_EXCHANGE');
  } catch (e) {
    if ((e as Error).message !== 'STOP_BOOTSTRAP_UNTIL_OAUTH_EXCHANGE') {
      console.warn('[oauth] early handler wrapper', e);
    }
  }
})();

createRoot(document.getElementById("root")!).render(
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
