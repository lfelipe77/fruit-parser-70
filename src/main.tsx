import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.tsx'
import './index.css'
import './i18n'

// --- EARLY OAUTH HANDLER (runs before router/guards) ---
import { supabase } from '@/integrations/supabase/client';

async function oauthEarly(): Promise<boolean> {
  const href = window.location.href;
  const hasCode   = href.includes('code=');
  const cbHash    = href.includes('#/auth-callback');
  const cbNonHash = href.includes('/auth/callback');
  console.log('[oauth-early] href:', href, { hasCode, cbHash, cbNonHash });

  if (!hasCode || (!cbHash && !cbNonHash)) return false;

  console.log('[oauth-early] exchanging code before app boot…');
  try {
    const { error } = await supabase.auth.exchangeCodeForSession(href);
    if (error) {
      console.error('[oauth-early] exchange error:', error);
      window.location.replace(`${window.location.origin}/#/login`);
      return true; // handled (we navigated)
    }
    // success → go to dashboard
    console.log('[oauth-early] exchange success');
    window.location.replace(`${window.location.origin}/#/dashboard`);
    return true; // handled
  } catch (e) {
    console.warn('[oauth-early] exchange threw:', e);
    window.location.replace(`${window.location.origin}/#/login`);
    return true; // handled
  }
}

// Wrap existing React render
(async function boot() {
  const handled = await oauthEarly();
  if (handled) return; // don't render the app under callback URL

  // ↓ keep existing render exactly as it was ↓
  createRoot(document.getElementById("root")!).render(
    <HelmetProvider>
      <App />
    </HelmetProvider>
  );
})();
