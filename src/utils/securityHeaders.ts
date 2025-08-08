/**
 * Utility functions for security headers
 */

export const getSecurityHeaders = () => {
  return {
    'X-Frame-Options': 'DENY',
    'Frame-Options': 'DENY',
    'Frame-ancestors': "'none'",
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com https://*.supabase.co https://whqxpuyjxoiufzhvqneg.functions.supabase.co; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-src https://challenges.cloudflare.com; base-uri 'self'; form-action 'self'; object-src 'none';",
    'X-XSS-Protection': '1; mode=block',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  };
};

export const addSecurityHeaders = (headers: Record<string, string> = {}) => {
  return {
    ...headers,
    ...getSecurityHeaders(),
  };
};

/**
 * Security headers for Edge Functions
 */
export const getEdgeFunctionSecurityHeaders = (corsOrigin: string = '*') => {
  return {
    'Access-Control-Allow-Origin': corsOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'X-Frame-Options': 'DENY',
    'Frame-Options': 'DENY',
    'Frame-ancestors': "'none'",
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Content-Security-Policy': "default-src 'self'; script-src 'self' https://challenges.cloudflare.com; connect-src 'self' https://challenges.cloudflare.com https://*.supabase.co https://whqxpuyjxoiufzhvqneg.functions.supabase.co; img-src 'self' data: https:; style-src 'self' 'unsafe-inline'; font-src 'self' data:; frame-src https://challenges.cloudflare.com; base-uri 'self'; form-action 'self'; object-src 'none';",
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-XSS-Protection': '1; mode=block',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
  };
};