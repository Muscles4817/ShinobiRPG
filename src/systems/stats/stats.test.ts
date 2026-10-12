import { createRng } from '@/core';

import { checkChance, rollCheck } from './checks';
import { createStats, diffStats } from './stats';

describe('stats', () => {
  it('creates stats from a base with bonuses', () => {
    const stats = createStats(5, { strength: 2 });
    expect(stats.strength).toBe(7);
    expect(stats.genjutsu).toBe(5);
  });

  it('diffs stats to two decimals, leaving unchanged stats out', () => {
    const before = createStats(5);
    expect(diffStats(before, { ...before, speed: 5.04 })).toEqual({ speed: 0.04 });
  });
});

describe('checks', () => {
  it('is a coin flip when value equals difficulty', () => {
    expect(checkChance(10, 10)).toBeCloseTo(0.5);
  });

  it('favours higher stats', () => {
    expect(checkChance(15, 10)).toBeGreaterThan(0.75);
    expect(checkChance(5, 10)).toBeLessThan(0.25);
  });

  it('rolls deterministically with a seeded rng', () => {
    expect(rollCheck(10, 10, createRng(3))).toEqual(rollCheck(10, 10, createRng(3)));
  });
});
