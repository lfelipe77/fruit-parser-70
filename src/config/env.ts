/**
 * Centralized environment variable access with runtime guards
 * Throws in development if required vars are missing, falls back to undefined in production
 */

interface EnvConfig {
  // Required for core functionality
  readonly SUPABASE_URL: string;
  readonly SUPABASE_PUBLISHABLE_KEY: string;
  readonly SUPABASE_PROJECT_ID: string;
  readonly TURNSTILE_SITEKEY: string;
  
  // Optional feature flags
  readonly DEBUG_HARDRELOAD?: string;
  readonly DEBUG_BLINK?: string;
  readonly DEBUG_BANNER?: string;
  readonly DEBUG_OVERLAY?: string;
  readonly ADMIN_TURNSTILE_BYPASS?: string;
  readonly DASH_MINIMAL?: string;
  readonly ENABLE_VISIT_LOGGER?: string;
  readonly DISABLE_GA?: string;
  readonly LOGO_URL?: string;
  readonly NOTIFICATIONS?: string;
}

function getEnvVar(key: string, required = false): string | undefined {
  const value = import.meta.env[`VITE_${key}`];
  
  if (required && !value) {
    if (import.meta.env.DEV) {
      throw new Error(`Required environment variable VITE_${key} is missing`);
    }
    console.warn(`Missing required environment variable VITE_${key}`);
  }
  
  return value;
}

export const env: EnvConfig = {
  // Required
  SUPABASE_URL: getEnvVar('SUPABASE_URL', true) || 'https://whqxpuyjxoiufzhvqneg.supabase.co',
  SUPABASE_PUBLISHABLE_KEY: getEnvVar('SUPABASE_PUBLISHABLE_KEY', true) || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndocXhwdXlqeG9pdWZ6aHZxbmVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxNjYyODMsImV4cCI6MjA2OTc0MjI4M30.lXLlvJkB48KSUsroImqkZSjNLpQjg7Pe_bYH5h6ztjo',
  SUPABASE_PROJECT_ID: getEnvVar('SUPABASE_PROJECT_ID', true) || 'whqxpuyjxoiufzhvqneg',
  TURNSTILE_SITEKEY: getEnvVar('TURNSTILE_SITEKEY', true) || '0x4AAAAAABpqGDEenRovXaTv',
  
  // Optional
  DEBUG_HARDRELOAD: getEnvVar('DEBUG_HARDRELOAD'),
  DEBUG_BLINK: getEnvVar('DEBUG_BLINK'),
  DEBUG_BANNER: getEnvVar('DEBUG_BANNER'),
  DEBUG_OVERLAY: getEnvVar('DEBUG_OVERLAY'),
  ADMIN_TURNSTILE_BYPASS: getEnvVar('ADMIN_TURNSTILE_BYPASS'),
  DASH_MINIMAL: getEnvVar('DASH_MINIMAL'),
  ENABLE_VISIT_LOGGER: getEnvVar('ENABLE_VISIT_LOGGER'),
  DISABLE_GA: getEnvVar('DISABLE_GA'),
  LOGO_URL: getEnvVar('LOGO_URL'),
  NOTIFICATIONS: getEnvVar('NOTIFICATIONS'),
} as const;