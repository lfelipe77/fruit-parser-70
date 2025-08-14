import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'
import './i18n'

// --- EARLY OAUTH HANDLER (runs before router/guards) ---
import { supabase } from '@/integrations/supabase/client';

function parseFragmentParams(href: string) {
  // HashRouter produces /#/auth-callback#access_token=...
  // so the fragment we want is after the *second* '#'
  const parts = href.split('#');
  const fragment = parts.length >= 3 ? parts[2] : parts[1] || '';
  return new URLSearchParams(fragment);
}

async function oauthEarly() {
  const href = window.location.href;
  const isHashCb    = href.includes('/#/auth-callback');
  const isNonHashCb = href.includes('/auth/callback');
  if (!isHashCb && !isNonHashCb) return;

  const params = parseFragmentParams(href);
  const hasAT   = params.has('access_token');
  const hasRT   = params.has('refresh_token');
  const hasCode = href.includes('code=');

  console.log('[oauth-early] href:', href, { hasCode, hasAT, cbHash: isHashCb, cbNonHash: isNonHashCb });
  console.log('[oauth-early] exchanging code/token before app boot…');

  try {
    if (hasAT && hasRT) {
      const access_token  = params.get('access_token')!;
      const refresh_token = params.get('refresh_token')!;
      const { data, error } = await supabase.auth.setSession({ access_token, refresh_token });
      if (error) throw error;
      console.log('[oauth-early] setSession success', { user: data.session?.user?.id });
    } else if (hasCode) {
      const { error } = await supabase.auth.exchangeCodeForSession(href);
      if (error) throw error;
      console.log('[oauth-early] code exchange success');
    }
    // Clean URL without reloading; then let the app boot
    history.replaceState(null, '', `${window.location.origin}/#/dashboard`);
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
