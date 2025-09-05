/**
 * Client-side sanitizer for ticket numbers - enforces exactly 5 pairs (00-99)
 * This is a UX helper before sending to API; DB still enforces the constraint
 */

export function sanitizeFivePairs(input: (string|number)[], ticketId?: string): string[] {
  const toPair = (v: any) => {
    const s = String(v ?? '').replace(/\D/g, '');
    return s ? s.slice(-2).padStart(2, '0') : null;
  };
  
  const valid = (input ?? [])
    .map(toPair)
    .filter((v): v is string => !!v && /^\d{2}$/.test(v))
    .slice(0, 5); // Hard cap at 5
  
  while (valid.length < 5) {
    // If ticketId provided, try deterministic-ish fill
    // Otherwise use random (since we can't do MD5 in browser easily)
    const rnd = Math.floor(Math.random() * 100);
    valid.push(String(rnd).padStart(2, '0'));
  }
  
  return valid;
}

/**
 * Generate exactly 5 random pairs for auto-fill functionality
 */
export function generateFiveRandomPairs(): string[] {
  const pairs: string[] = [];
  for (let i = 0; i < 5; i++) {
    const rnd = Math.floor(Math.random() * 100);
    pairs.push(String(rnd).padStart(2, '0'));
  }
  return pairs;
}

/**
 * Validate that input represents exactly 5 valid 2-digit pairs
 */
export function isValidFivePairs(input: unknown): boolean {
  if (!Array.isArray(input)) return false;
  if (input.length !== 5) return false;
  return input.every(item => 
    typeof item === 'string' && /^\d{2}$/.test(item)
  );
}

/**
 * Format pairs for display (e.g., "01 · 23 · 45 · 67 · 89")
 */
export function formatPairsForDisplay(pairs: string[]): string {
  return pairs.join(' · ');
}
