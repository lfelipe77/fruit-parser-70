import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'
import './i18n'

// --- EARLY OAUTH HANDLER (runs before router/guards) ---
import { supabase } from '@/integrations/supabase/client';

async function oauthEarly() {
  const href = window.location.href;
  const isHashCb    = href.includes('#/auth-callback');
  const isNonHashCb = href.includes('/auth/callback');
  const hasCode        = href.includes('code=');
  const hasAccessToken = href.includes('access_token=');

  if (!(isHashCb || isNonHashCb)) return; // nothing to do

  console.log('[oauth-early] href:', href, { hasCode, hasAccessToken, cbHash: isHashCb, cbNonHash: isNonHashCb });
  console.log('[oauth-early] exchanging code/token before app boot…');

  try {
    if (hasAccessToken) {
      // Some type defs omit this method; it exists at runtime in supabase-js v2.
      // @ts-ignore
      const { error } = await supabase.auth.getSessionFromUrl({ storeSession: true });
      if (error) throw error;
      console.log('[oauth-early] session from URL success');
    } else if (hasCode) {
      const { error } = await supabase.auth.exchangeCodeForSession(href);
      if (error) throw error;
      console.log('[oauth-early] code exchange success');
    }
    // Clean URL and stay on the same page (no reload)
    history.replaceState(null, '', `${window.location.origin}/#/dashboard`);
    // Do NOT hard-redirect; allow React to boot with the stored session.
  } catch (e) {
    console.error('[oauth-early] failed', e);
    history.replaceState(null, '', `${window.location.origin}/#/login`);
  }
}

// Boot after handling OAuth (no STOP_BOOTSTRAP throws, no window.location.replace)
(async () => {
  await oauthEarly();
  // existing React render here (unchanged):
  createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
})();
