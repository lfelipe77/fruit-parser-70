export function shareUrlForRaffle(raffle: { slug: string; updated_at?: string; updatedAt?: string; id: string }) {
  const v = encodeURIComponent(raffle.updated_at ?? raffle.updatedAt ?? raffle.id);
  return `https://ganhavel.com/ganhavel/${raffle.slug}.html?v=${v}`;
}

export function openUrlForRaffle(raffle: { slug: string }) {
  return `https://ganhavel.com/ganhavel/${raffle.slug}`;
}