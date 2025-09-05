/**
 * Number formatting utilities for ticket numbers
 * Handles various input formats and normalizes to consistent 5-pair format
 */

export function toFiveSingles(input: unknown): string[] {
  // 5 singles: ["12","92","51","18","77"]
  if (Array.isArray(input) && input.every(x => typeof x === 'string')) {
    const arr = input as string[];
    return [
      arr[0] ?? '00',
      arr[1] ?? '00',
      arr[2] ?? '00',
      arr[3] ?? '00',
      arr[4] ?? '00',
    ].map(s => s.padStart(2,'0'));
  }

  // 5 pairs: [["12","92"], ...]
  if (Array.isArray(input) && input.every(x => Array.isArray(x))) {
    const pairs = input as unknown[][];
    const a = pairs.map(p => String((p?.[0] ?? '00')).padStart(2,'0'));
    return [a[0]??'00', a[1]??'00', a[2]??'00', a[3]??'00', a[4]??'00'];
  }

  // "12-92-51-18-77"
  if (typeof input === 'string') {
    const m = input.match(/\d{2}/g) ?? [];
    return [
      m[0] ?? '00', m[1] ?? '00', m[2] ?? '00', m[3] ?? '00', m[4] ?? '00',
    ];
  }

  return ['00','00','00','00','00'];
}

export const formatFiveSingles = (a: string[]) =>
  a.slice(0,5).map(s => s.padStart(2,'0')).join(' · ');

// Legacy exports for backward compatibility
export type FiveSingles = [string, string, string, string, string];
export const normalizeToFiveSingles = (input: unknown): FiveSingles => 
  toFiveSingles(input) as FiveSingles;