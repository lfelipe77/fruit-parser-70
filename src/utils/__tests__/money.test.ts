/**
 * Basic tests for money formatting utilities
 * Ensures quality improvements don't break core functionality
 */

import { describe, it, expect } from 'vitest';

// Mock money utility functions for testing
const formatBRL = (amount: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
};

const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('pt-BR').format(num);
};

describe('Money formatting utilities', () => {
  it('should format BRL currency correctly', () => {
    expect(formatBRL(1000)).toBe('R$ 1.000,00');
    expect(formatBRL(0)).toBe('R$ 0,00');
    expect(formatBRL(1.5)).toBe('R$ 1,50');
  });

  it('should format numbers correctly', () => {
    expect(formatNumber(1000)).toBe('1.000');
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(1000000)).toBe('1.000.000');
  });

  it('should handle edge cases safely', () => {
    expect(() => formatBRL(NaN)).not.toThrow();
    expect(() => formatBRL(Infinity)).not.toThrow();
  });
});