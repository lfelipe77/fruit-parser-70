export type RaffleLike = { 
  id: string; 
  slug?: string | null; 
};

/**
 * Generate internal app URL for navigation (no .html)
 */
export const appUrlFor = (raffle: RaffleLike): string => {
  return `/ganhavel/${raffle.slug || raffle.id}`;
};

/**
 * Generate share URL for social media and previews (.html for meta worker)
 */
export const shareUrlFor = (raffle: RaffleLike): string => {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://ganhavel.com';
  const base = origin.includes('ganhavel.com') ? 'https://ganhavel.com' : origin;
  return `${base}/ganhavel/${raffle.slug || raffle.id}`;
};