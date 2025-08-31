// Simple feature flags utility that doesn't depend on any database tables
// Returns fallback values only - no network or DB calls

export function getFlag<T = boolean>(key: string, fallback: T): T {
  // No network/DB calls. Return fallback only.
  // This ensures the app works even if app_flags table doesn't exist
  return fallback;
}

// Common feature flags with their default values
export const FEATURE_FLAGS = {
  enableNewDesign: false,
  enableAdvancedFilters: true,
  enableSocialSharing: true,
  enablePaymentV2: false,
  ticketsEnforce5DigitPairs: false, // Gate for tickets normalization
} as const;

export function isFeatureEnabled(flag: keyof typeof FEATURE_FLAGS): boolean {
  return getFlag(flag, FEATURE_FLAGS[flag]);
}