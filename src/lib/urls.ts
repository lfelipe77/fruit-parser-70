export function shareUrlForRaffle(raffle: { slug: string; updated_at?: string; updatedAt?: string; id: string }) {
  const v = raffle.id; // Clean cache buster using raffle ID
  return `https://ganhavel.com/ganhavel/${raffle.slug}.html?v=${v}`;
}

export function openUrlForRaffle(raffle: { slug: string }) {
  return `https://ganhavel.com/ganhavel/${raffle.slug}`;
}

export function copyUrlForRaffle(raffle: { slug?: string | null; id?: string }) {
  return `/ganhavel/${raffle.slug || raffle.id}`; // Clean copy link for humans (no query)
}