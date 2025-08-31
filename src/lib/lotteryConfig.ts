export const FIVE_PAIRS = 5 as const;
export const PAIR_REGEX = /^\d{2}$/;

// Re-export sanitizer from existing location
export { sanitizeFivePairs, generateFiveRandomPairs, isValidFivePairs, formatPairsForDisplay } from './clientTicketSanitizer';