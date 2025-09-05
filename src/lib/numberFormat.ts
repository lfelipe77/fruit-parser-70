/**
 * Number formatting utilities for ticket numbers
 * Handles various input formats and normalizes to consistent 5-pair format
 */

export type FiveSingles = [string, string, string, string, string];

const two = (s: string) => (s ?? '').padStart(2,'0').slice(-2);

export function normalizeToFiveSingles(input: unknown): FiveSingles {
  // 5 strings already?
  if (Array.isArray(input) && input.length === 5 && input.every(x => typeof x === 'string')) {
    return input.map(two) as FiveSingles;
  }
  
  // string "77-20-31-96-16"
  if (typeof input === 'string') {
    const v = input.split(/\D+/).filter(Boolean).map(two);
    return [two(v[0]), two(v[1]), two(v[2]), two(v[3]), two(v[4])] as FiveSingles;
  }
  
  // legacy: [[ "77","??" ], ["20","??"], ... ] -> take first of each pair
  if (Array.isArray(input) && input.length === 5 && input.every(x => Array.isArray(x))) {
    const v = (input as unknown[]).map((p:any[]) => two(p?.[0]));
    return [two(v[0]), two(v[1]), two(v[2]), two(v[3]), two(v[4])] as FiveSingles;
  }
  
  // fallback
  return ['00','00','00','00','00'];
}

export function formatFiveSingles(v: FiveSingles) {
  return `${v[0]}-${v[1]}-${v[2]}-${v[3]}-${v[4]}`;
}