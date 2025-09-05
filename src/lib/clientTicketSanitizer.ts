/**
 * Client-side sanitizer for ticket numbers - enforces exactly 5 pairs (00-99)
 * This is a UX helper before sending to API; DB still enforces the constraint
 */

export function sanitizeFivePairs(input: (string|number)[], ticketId?: string): string[][] {
  const toPair = (v: any) => {
    const s = String(v ?? '').replace(/\D/g, '');
    return s ? s.slice(-2).padStart(2, '0') : null;
  };
  
  // Extract exactly 5 valid pairs
  const validStrings = (input ?? [])
    .map(toPair)
    .filter((v): v is string => !!v && /^\d{2}$/.test(v))
    .slice(0, 10); // Take up to 10 strings to form 5 pairs
  
  // Fill to have exactly 10 strings (5 pairs)
  while (validStrings.length < 10) {
    const rnd = Math.floor(Math.random() * 100);
    validStrings.push(String(rnd).padStart(2, '0'));
  }
  
  // Convert to 5 pairs of 2-digit strings
  const pairs: string[][] = [];
  for (let i = 0; i < 10; i += 2) {
    pairs.push([validStrings[i], validStrings[i + 1]]);
  }
  
  return pairs;
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
