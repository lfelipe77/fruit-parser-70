import type { SupabaseClient } from "@supabase/supabase-js";

export type RaffleLike = { id: string; slug?: string | null; title?: string | null };

function toPrettyPath(key: string) {
  // Always send crawlers to the meta worker (.html)
  return `/ganhavel/${encodeURIComponent(key)}.html`;
}

// New clean URL without .html for app navigation
function toAppPath(key: string) {
  return `/ganhavel/${encodeURIComponent(key)}`;
}

export function buildPrettyShareUrlSync(raffle: RaffleLike, origin?: string) {
  const base = origin || (typeof window !== "undefined" ? window.location.origin : "https://ganhavel.com");
  const key = raffle.slug && raffle.slug.trim() ? raffle.slug : raffle.id;
  return `${base}${toPrettyPath(key)}`;
}

export function buildAppUrlSync(raffle: RaffleLike) {
  const key = raffle.slug && raffle.slug.trim() ? raffle.slug : raffle.id;
  return toAppPath(key);
}

/**
 * Ensures we use the slug when available.
 * If the caller didn't provide a slug, look it up by id (one tiny query).
 */
export async function buildPrettyShareUrl(
  raffle: RaffleLike,
  supabase: SupabaseClient,
  origin?: string
): Promise<string> {
  let key = raffle.slug && raffle.slug.trim() ? raffle.slug : "";

  if (!key) {
    // Try to fetch slug once
    const { data, error } = await supabase
      .from("raffles")
      .select("slug")
      .eq("id", raffle.id)
      .maybeSingle();

    if (!error && data?.slug) key = data.slug;
  }

  if (!key) key = raffle.id; // last-resort fallback

  const base = origin || (typeof window !== "undefined" ? window.location.origin : "https://ganhavel.com");
  return `${base}${toPrettyPath(key)}`;
}