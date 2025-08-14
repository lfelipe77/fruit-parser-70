export async function withTimeout<T>(promise: Promise<T>, ms = 5000, label = 'op'): Promise<T> {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(`timeout:${label}`), ms);
  try {
    // @ts-ignore
    return await promise;
  } finally {
    clearTimeout(id);
  }
}

export async function safeFetch(url: string, init: RequestInit = {}, ms = 5000, label = 'fetch') {
  const ctrl = new AbortController();
  const id = setTimeout(() => ctrl.abort(`timeout:${label}`), ms);
  try {
    const res = await fetch(url, { ...init, signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(id);
  }
}