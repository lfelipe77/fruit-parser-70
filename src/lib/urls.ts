export function shareUrlForRaffle(raffle: { slug?: string | null; updated_at?: string; updatedAt?: string; id: string }) {
  const v = raffle.id; // Clean cache buster using raffle ID
  const key = raffle.slug && raffle.slug.trim() ? raffle.slug : raffle.id;
  return `https://ganhavel.com/ganhavel/${key}.html?v=${v}`;
}

export function openUrlForRaffle(raffle: { slug: string }) {
  return `https://ganhavel.com/ganhavel/${raffle.slug}`;
}

export function copyUrlForRaffle(raffle: { slug?: string | null; id?: string }) {
  return `/ganhavel/${raffle.slug || raffle.id}`; // Clean copy link for humans (no query)
}