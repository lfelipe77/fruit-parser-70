/**
 * Logging utility with production-safe debug stripping
 * console.debug calls are stripped in production builds
 */

export const log = {
  /**
   * Debug logs - stripped in production builds via terser
   * Use for verbose development-only logging
   */
  debug: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.debug(...args);
    }
  },
  
  /**
   * Info logs - kept in production
   * Use for important user-visible information
   */
  info: console.info,
  
  /**
   * Warning logs - kept in production
   * Use for recoverable errors or important notices
   */
  warn: console.warn,
  
  /**
   * Error logs - kept in production
   * Use for actual errors that need attention
   */
  error: console.error,
} as const;