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
  const hasAccessToken = href.includes('access_token=');
  const cbHash    = href.includes('#/auth-callback');
  const cbNonHash = href.includes('/auth/callback');
  console.log('[oauth-early] href:', href, { hasCode, hasAccessToken, cbHash, cbNonHash });

  if ((!hasCode && !hasAccessToken) || (!cbHash && !cbNonHash)) return false;

  console.log('[oauth-early] exchanging code/token before app boot…');
  try {
    if (hasCode) {
      // PKCE flow with code
      const { error } = await supabase.auth.exchangeCodeForSession(href);
      if (error) {
        console.error('[oauth-early] exchange error:', error);
        window.location.replace(`${window.location.origin}/#/login`);
        return true; // handled (we navigated)
      }
      console.log('[oauth-early] exchange success');
      // Update URL without reloading and let React boot
      history.replaceState(null, '', `${window.location.origin}/#/dashboard`);
      return false; // let app boot with stored session
    } else if (hasAccessToken) {
      // Implicit flow with access_token (fallback)
      // The session should already be detected via detectSessionInUrl: true
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        console.error('[oauth-early] session from URL error:', error);
        window.location.replace(`${window.location.origin}/#/login`);
        return true; // handled (we navigated)
      }
      console.log('[oauth-early] session from URL success');
      // Update URL without reloading and let React boot
      history.replaceState(null, '', `${window.location.origin}/#/dashboard`);
      return false; // let app boot with stored session
    }
    
    // This shouldn't be reached now, but keeping as fallback
    return false;
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
