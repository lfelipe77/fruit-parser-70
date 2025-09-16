export type RaffleLike = { id: string; slug?: string | null };

/**
 * Generate clean app URLs for internal navigation (no .html)
 */
export function appUrlFor(raffle: RaffleLike): string {
  const key = raffle.slug && raffle.slug.trim() ? raffle.slug : raffle.id;
  return `/ganhavel/${encodeURIComponent(key)}`;
}

/**
 * Generate social share URLs with .html for meta worker
 * C) Handle preview domains properly
 */
export function shareUrlFor(raffle: RaffleLike, origin?: string): string {
  const currentOrigin = origin || (typeof window !== "undefined" ? window.location.origin : "https://ganhavel.com");
  // Use ganhavel.com for production, otherwise use current origin for previews
  const base = currentOrigin.includes('ganhavel.com') ? 'https://ganhavel.com' : currentOrigin;
  const key = raffle.slug && raffle.slug.trim() ? raffle.slug : raffle.id;
  return `${base}/ganhavel/${encodeURIComponent(key)}.html`;
}

/**
 * Check if a string looks like a UUID
 */
export function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
}