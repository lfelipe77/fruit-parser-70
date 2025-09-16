import type { SupabaseClient } from "@supabase/supabase-js";
import { shareUrlFor } from "./urlHelpers";

export type RaffleLike = { id: string; slug?: string | null };

export function buildPrettyShareUrlSync(raffle: RaffleLike, origin?: string) {
  return shareUrlFor(raffle, origin);
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

  return shareUrlFor({ id: raffle.id, slug: key }, origin);
}