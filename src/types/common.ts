/**
 * Common TypeScript types for improved type safety
 */

// Basic readonly props pattern
export interface ReadonlyProps {
  readonly children?: React.ReactNode;
}

// Environment flag type
export type FeatureFlag = 'true' | 'false' | '1' | '0' | undefined;

// Safe unknown type guard
export function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

// String type guard
export function isString(value: unknown): value is string {
  return typeof value === 'string';
}

// Number type guard  
export function isNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value);
}

// Error boundary state
export interface ErrorBoundaryState {
  readonly hasError: boolean;
  readonly error?: Error;
}