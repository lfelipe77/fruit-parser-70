// src/lib/turnstileDebug.ts
const FN_URL = (import.meta.env.VITE_SUPABASE_FUNCTIONS_URL || '').replace(/\/$/, '');

function shouldRun(): boolean {
  if (import.meta.env.DEV) return true;
  try {
    const p = new URL(window.location.href).searchParams;
    return p.get('tsdebug') === '1';
  } catch { return false; }
}

function log(...args: any[]) { console.log('[TSDEBUG]', ...args); }

async function tryExecute(selector: string, action: string) {
  const ts: any = (window as any).turnstile;
  const el = document.querySelector(selector) as HTMLElement | null;
  if (!ts || !el) return { ok: false, reason: 'not_ready' as const };
  el.setAttribute('data-size', 'invisible');
  el.setAttribute('data-action', action);
  return new Promise<{ ok: boolean; token?: string; reason?: string }>((resolve) => {
    (window as any)._ts_dbg_cb = (token: string) => resolve({ ok: true, token });
    el.setAttribute('data-callback', '_ts_dbg_cb');
    try { ts.execute(el); } catch { resolve({ ok: false, reason: 'execute_failed' }); }
    setTimeout(() => resolve({ ok: false, reason: 'timeout' }), 4000);
  });
}

export async function runTurnstileDiagnostics(
  selector: '#turnstile-login' | '#turnstile-signup',
  action: 'login' | 'signup'
) {
  if (!shouldRun()) return;
  try {
    log('starting…');
    const tsType = typeof (window as any).turnstile;
    log('turnstile object type:', tsType);
    const el = document.querySelector(selector) as HTMLElement | null;
    if (!el) { log('container missing', selector); return; }
    log('attrs', {
      sitekey: el.getAttribute('data-sitekey'),
      size: el.getAttribute('data-size'),
      action: el.getAttribute('data-action'),
    });

    const execRes = await tryExecute(selector, action);
    if (!execRes.ok) { log('execute skipped/failed:', execRes); return; }
    log('token received (first 16):', (execRes.token || '').slice(0, 16));

    if (!FN_URL) { log('FN_URL missing, skip verify'); return; }
    const r = await fetch(`${FN_URL}/verify-turnstile`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: execRes.token, action }),
    });
    const j = await r.json().catch(() => ({}));
    log('verify response:', r.status, j);
  } catch (e) {
    log('error', e);
  }
}
