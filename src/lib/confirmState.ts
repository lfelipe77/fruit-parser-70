// src/lib/confirmState.ts
// Soft, resilient wrapper for confirm-state-get calls (flag-gated)

const FEATURE = import.meta.env.VITE_FEATURE_SOFT_CONFIRM_STATE === 'true';
const BASE = Number(import.meta.env.VITE_CONFIRM_STATE_BACKOFF_BASE_MS ?? 2000);
const MAX = Number(import.meta.env.VITE_CONFIRM_STATE_BACKOFF_MAX_MS ?? 30000);

const PROJECT_FN_BASE = 'https://whqxpuyjxoiufzhvqneg.supabase.co/functions/v1';

function backoff(attempt: number) {
  return Math.min(MAX, BASE * Math.pow(2, attempt));
}

export type ConfirmStateResponse = {
  ok: boolean;
  [key: string]: any;
};

export async function safeConfirmStateGet(reservationId: string, accessToken: string, attempt = 0): Promise<ConfirmStateResponse> {
  const url = `${PROJECT_FN_BASE}/confirm-state-get?reservationId=${encodeURIComponent(reservationId)}`;
  try {
    const r = await fetch(url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      headers: {
        // Keep GET simple: do not set Content-Type to avoid preflight when possible
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    return await r.json();
  } catch (e) {
    if (!FEATURE) throw e as Error;
    console.warn('[confirm-state-get] soft-fail', reservationId, e);
    return { ok: false, transient: true, error: String((e as Error).message || e) } as any;
  }
}

export async function retryConfirmState(reservationId: string, accessToken: string, maxAttempts = 3) {
  let attempt = 0;
  while (attempt < maxAttempts) {
    const res = await safeConfirmStateGet(reservationId, accessToken, attempt);
    if (res?.ok) return res;
    await new Promise(r => setTimeout(r, backoff(attempt++)));
  }
  return { ok: false, transient: true, exhausted: true } as any;
}
