import { createRng } from '@/core';

import { checkChance, rollCheck } from './checks';
import { applyTraining, createStats, diffStats, trainingGain, unmetRequirements } from './stats';

describe('stats', () => {
  it('creates stats from a base with bonuses', () => {
    const stats = createStats(5, { strength: 2 });
    expect(stats.strength).toBe(7);
    expect(stats.genjutsu).toBe(5);
  });

  it('has diminishing training returns', () => {
    expect(trainingGain(0, 1)).toBeGreaterThan(trainingGain(50, 1));
  });

  it('applies training only to the trained stats', () => {
    const before = createStats(5);
    const after = applyTraining(before, { speed: 1 });
    expect(after.speed).toBeGreaterThan(before.speed);
    expect(diffStats(before, after)).toEqual({ speed: 0.8 });
  });

  it('reports unmet requirements', () => {
    const stats = createStats(5, { ninjutsu: 5 });
    expect(unmetRequirements(stats, { ninjutsu: 8, intellect: 6 })).toEqual(['intellect']);
    expect(unmetRequirements(stats, { ninjutsu: 10 })).toEqual([]);
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
