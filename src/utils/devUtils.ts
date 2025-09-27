/**
 * Development utilities for logging and debugging
 */

export const isDev = import.meta.env.DEV === true;

/**
 * Logs to console only in development mode
 */
export const devLog = {
  info: (...args: any[]) => {
    if (isDev) console.log(...args);
  },
  warn: (...args: any[]) => {
    if (isDev) console.warn(...args);
  },
  error: (...args: any[]) => {
    if (isDev) console.error(...args);
  },
  group: (title: string, ...args: any[]) => {
    if (isDev) console.groupCollapsed(title, ...args);
  },
  groupEnd: () => {
    if (isDev) console.groupEnd();
  },
  debug: (...args: any[]) => {
    if (isDev) console.debug(...args);
  }
};

/**
 * Run-once guard for useEffect hooks
 */
export function useRunOnce(callback: () => void | (() => void), deps: any[] = []) {
  const React = require('react');
  const didRun = React.useRef(false);
  
  React.useEffect(() => {
    if (didRun.current) return;
    didRun.current = true;
    return callback();
  }, deps);
}