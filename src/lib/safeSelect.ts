// src/lib/sbSafe.ts
export function safeSelect(sel: string) {
  if (/!inner|%21inner/i.test(sel)) {
    throw new Error('Forbidden join: !inner — use two-step fetch and merge by id');
  }
  return sel;
}

// Progress clamping utility
function clampPct(n: any) {
  const x = Number(n ?? 0);
  return Math.max(0, Math.min(100, Number.isFinite(x) ? x : 0));
}

// Safe progress fetch with error handling
export async function safeProgressFetch<T>(
  fetchFn: () => Promise<T[]>,
  fallback: T[] = []
): Promise<T[]> {
  try {
    return await fetchFn();
  } catch (error) {
    console.warn('Progress fetch failed, using fallback:', error);
    return fallback;
  }
}

export { clampPct };