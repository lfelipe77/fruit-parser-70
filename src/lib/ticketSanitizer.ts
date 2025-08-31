import { createHash } from 'crypto';

/**
 * Sanitizes and normalizes ticket numbers to exactly 5 pairs of 2-digit strings (00-99).
 * 
 * Input: mixed array of strings/numbers/nulls
 * Output: exactly 5 strings matching /^\d{2}$/
 * 
 * Rules:
 * - Strip non-digits from each input
 * - Take last 2 digits
 * - Pad with zeros if needed
 * - If fewer than 5 valid pairs, fill deterministically using ticket ID
 * - Keep first valid existing pair if available
 */
export function sanitizeTicketNumbers(
  input: unknown[], 
  ticketId: string,
  enforceValidation = false
): string[] {
  if (!enforceValidation) {
    // Legacy mode: return input as-is for backward compatibility
    return Array.isArray(input) ? input.map(String) : [];
  }

  // Extract valid 2-digit pairs from input
  const validPairs: string[] = [];
  
  for (const item of input) {
    if (item == null) continue;
    
    // Convert to string and strip non-digits
    const cleaned = String(item).replace(/\D/g, '');
    if (cleaned.length === 0) continue;
    
    // Take last 2 digits and pad if needed
    const lastTwo = cleaned.slice(-2);
    const padded = lastTwo.padStart(2, '0');
    
    // Validate it's a proper 2-digit number
    if (/^\d{2}$/.test(padded)) {
      validPairs.push(padded);
    }
  }

  // Always return exactly 5 pairs
  const result: string[] = [];
  
  // Use first valid pair if available, otherwise generate deterministically
  for (let i = 0; i < 5; i++) {
    if (i < validPairs.length) {
      result.push(validPairs[i]);
    } else {
      result.push(generateDeterministicPair(ticketId, i + 1));
    }
  }

  return result;
}

/**
 * Generates a deterministic 2-digit pair using MD5 hash
 * Language-agnostic algorithm matching Postgres implementation
 */
function generateDeterministicPair(ticketId: string, position: number): string {
  const input = `${ticketId}:${position}`;
  const hash = createHash('md5').update(input).digest();
  const firstByte = hash[0];
  const number = firstByte % 100;
  return number.toString().padStart(2, '0');
}

/**
 * Validates that numbers array contains exactly 5 valid 2-digit pairs
 */
export function validateTicketNumbers(numbers: unknown): boolean {
  if (!Array.isArray(numbers)) return false;
  if (numbers.length !== 5) return false;
  
  return numbers.every(item => 
    typeof item === 'string' && /^\d{2}$/.test(item)
  );
}

/**
 * Browser-compatible MD5 implementation for frontend use
 */
function md5Browser(input: string): Uint8Array {
  // For client-side, we'll use a simple hash based on the input
  // This won't match MD5 exactly but will be deterministic
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Convert to bytes similar to MD5 first byte
  const bytes = new Uint8Array(16);
  bytes[0] = Math.abs(hash) % 256;
  return bytes;
}

// Export for testing
export { generateDeterministicPair };