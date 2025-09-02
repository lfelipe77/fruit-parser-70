import { describe, it, expect } from 'vitest';
import { clampPct } from '../src/lib/safeSelect';

describe('merge/clamp', () => {
  it('left-keeps rows and clamps >100 to 100', () => {
    const base = [{ id:'a', user_id:'u', title:null, status:'active', goal_amount:null, image_url:null, created_at:'x' }];
    const pmap = new Map([['a', { amount_raised: 10, progress_pct_money: 173 }]]);
    
    // Simulate the merge operation
    const out = base.map((r: any) => ({
      ...r,
      amount_raised: pmap.get(r.id)?.amount_raised ?? 0,
      progress_pct_money: clampPct(pmap.get(r.id)?.progress_pct_money ?? 0),
    }));
    
    expect(out[0].progress_pct_money).toBe(100);
  });

  it('clamps negative values to 0', () => {
    expect(clampPct(-10)).toBe(0);
    expect(clampPct(null)).toBe(0);
    expect(clampPct(undefined)).toBe(0);
    expect(clampPct('invalid')).toBe(0);
  });

  it('handles valid ranges correctly', () => {
    expect(clampPct(0)).toBe(0);
    expect(clampPct(50)).toBe(50);
    expect(clampPct(100)).toBe(100);
    expect(clampPct(25.7)).toBe(25.7);
  });

  it('clamps over-100 values', () => {
    expect(clampPct(150)).toBe(100);
    expect(clampPct(999)).toBe(100);
  });
});