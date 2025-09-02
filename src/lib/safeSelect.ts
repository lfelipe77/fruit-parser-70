import { SupabaseClient } from '@supabase/supabase-js';

// Runtime guard to prevent !inner usage in select queries
export function safeSelect<T>(
  client: ReturnType<SupabaseClient['from']>,
  columns: string
) {
  if (columns.includes('!inner') || columns.includes('%21inner')) {
    throw new Error(
      `Forbidden: !inner joins are not allowed in select queries. Column spec: ${columns}`
    );
  }
  return client.select(columns);
}

// Progress clamping utility
export function clampProgress(value: unknown): number {
  const num = Number(value ?? 0);
  return Math.max(0, Math.min(100, isNaN(num) ? 0 : num));
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