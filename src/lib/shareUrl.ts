export type RaffleLike = { id: string; slug?: string | null };

export function buildPrettyShareUrl(raffle: RaffleLike) {
  const base = window?.location?.origin || "https://ganhavel.com";
  const key = raffle.slug && raffle.slug.trim() ? raffle.slug : raffle.id;
  // We'll standardize on `.html` so bots always see OG tags
  return `${base}/ganhavel/${encodeURIComponent(key)}.html`;
}