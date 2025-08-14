export function withTimeout<T>(p: Promise<T>, ms = 5000, label = 'op'): Promise<T> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(`timeout:${label}`), ms);
  return (async () => {
    try {
      // @ts-ignore
      const r = await p;
      return r;
    } finally {
      clearTimeout(t);
    }
  })();
}

export async function safeFetch(url: string, init: RequestInit = {}, ms = 5000, label = 'fetch') {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(`timeout:${label}`), ms);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(t);
  }
}