import { describe, it, expect } from 'vitest';
import { clampProgress } from '../src/lib/safeSelect';

describe('Raffles Merge Logic', () => {
  describe('clampProgress', () => {
    it('clamps values to 0-100 range', () => {
      expect(clampProgress(-10)).toBe(0);
      expect(clampProgress(0)).toBe(0);
      expect(clampProgress(50)).toBe(50);
      expect(clampProgress(100)).toBe(100);
      expect(clampProgress(150)).toBe(100);
    });

    it('handles invalid inputs gracefully', () => {
      expect(clampProgress(null)).toBe(0);
      expect(clampProgress(undefined)).toBe(0);
      expect(clampProgress('invalid')).toBe(0);
      expect(clampProgress(NaN)).toBe(0);
      expect(clampProgress({})).toBe(0);
    });

    it('handles string numbers correctly', () => {
      expect(clampProgress('50')).toBe(50);
      expect(clampProgress('0')).toBe(0);
      expect(clampProgress('100')).toBe(100);
      expect(clampProgress('-5')).toBe(0);
      expect(clampProgress('120')).toBe(100);
    });

    it('handles floating point numbers', () => {
      expect(clampProgress(25.7)).toBe(25.7);
      expect(clampProgress(99.99)).toBe(99.99);
      expect(clampProgress(-0.1)).toBe(0);
      expect(clampProgress(100.1)).toBe(100);
    });
  });

  describe('merge behavior simulation', () => {
    it('simulates left merge with progress data', () => {
      const raffles = [
        { id: '1', title: 'Raffle 1', status: 'active' },
        { id: '2', title: 'Raffle 2', status: 'completed' },
        { id: '3', title: 'Raffle 3', status: 'active' }
      ];

      const progressData = [
        { id: '1', progress_pct_money: 75, amount_raised: 750 },
        { id: '3', progress_pct_money: 120, amount_raised: 1200 } // Over 100%
        // Note: id '2' missing from progress data
      ];

      const merged = raffles.map(raffle => {
        const progress = progressData.find(p => p.id === raffle.id);
        return {
          ...raffle,
          amount_raised: progress?.amount_raised ?? 0,
          progress_pct_money: clampProgress(progress?.progress_pct_money)
        };
      });

      expect(merged).toEqual([
        { id: '1', title: 'Raffle 1', status: 'active', amount_raised: 750, progress_pct_money: 75 },
        { id: '2', title: 'Raffle 2', status: 'completed', amount_raised: 0, progress_pct_money: 0 },
        { id: '3', title: 'Raffle 3', status: 'active', amount_raised: 1200, progress_pct_money: 100 }
      ]);
    });

    it('handles empty progress data gracefully', () => {
      const raffles = [
        { id: '1', title: 'Raffle 1', status: 'active' }
      ];

      const progressData: any[] = [];

      const merged = raffles.map(raffle => {
        const progress = progressData.find(p => p.id === raffle.id);
        return {
          ...raffle,
          amount_raised: progress?.amount_raised ?? 0,
          progress_pct_money: clampProgress(progress?.progress_pct_money)
        };
      });

      expect(merged).toEqual([
        { id: '1', title: 'Raffle 1', status: 'active', amount_raised: 0, progress_pct_money: 0 }
      ]);
    });
  });
});