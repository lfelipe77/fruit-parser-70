/**
 * Utility functions for security headers
 */

export const getSecurityHeaders = () => {
  return {
    'Content-Security-Policy': `
      default-src 'self'; 
      script-src 'self' 'unsafe-eval' 'unsafe-inline' https://challenges.cloudflare.com https://www.gstatic.com https://www.recaptcha.net; 
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; 
      font-src 'self' https://fonts.gstatic.com; 
      img-src * data: blob:; 
      connect-src * ws: wss:; 
      frame-ancestors 'none'; 
      object-src 'none'; 
      base-uri 'self'; 
      form-action 'self';
    `.replace(/\s+/g, ' ').trim(),
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
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
    'Content-Security-Policy': "default-src 'self'; script-src 'self' https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline'; img-src * data: blob:; connect-src *; frame-ancestors 'none';",
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload',
    'X-XSS-Protection': '1; mode=block',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };
};