// Edge Function helpers for consistent header management
export function edgeBase() {
  return import.meta.env.VITE_SUPABASE_EDGE_URL || import.meta.env.VITE_SUPABASE_URL;
}

export function edgeHeaders(jwt?: string) {
  const headers: Record<string, string> = {
    apikey: import.meta.env.VITE_SUPABASE_ANON_KEY!,            // REQUIRED by Supabase gateway
    "Content-Type": "application/json",
  };
  if (jwt) headers.Authorization = `Bearer ${jwt}`;              // your user session
  return headers;
}