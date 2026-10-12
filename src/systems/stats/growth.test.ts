import { round2 } from '@/core';

import {
  applyTraining,
  SESSION_PACE,
  SOLO_EFFICIENCY,
  soloEfficiency,
  trainingGain,
} from './growth';
import { createStats, diffStats } from './stats';
import { STAT_TIERS } from './tiers';

const TIRELESS = [{ floor: 0.4, throughGrade: 'B' }] as const;

describe('growth', () => {
  it('keeps each grade’s solo efficiency through the lower part of its band', () => {
    expect(soloEfficiency(2)).toBe(SOLO_EFFICIENCY.E);
    expect(soloEfficiency(9)).toBe(SOLO_EFFICIENCY.D);
    expect(soloEfficiency(14)).toBe(SOLO_EFFICIENCY.C);
    expect(soloEfficiency(21)).toBe(SOLO_EFFICIENCY.B);
    expect(soloEfficiency(30)).toBe(SOLO_EFFICIENCY.A);
    expect(soloEfficiency(45)).toBe(SOLO_EFFICIENCY.S);
  });

  it('falls steeply by grade', () => {
    const order = [2, 9, 14, 21, 30, 45].map((v) => soloEfficiency(v));
    for (let i = 1; i < order.length; i++) expect(order[i]).toBeLessThan(order[i - 1]!);
  });

  it('eases into the next grade without a cliff at the boundary', () => {
    for (const tier of STAT_TIERS.slice(1)) {
      const below = soloEfficiency(tier.min - 0.01);
      const at = soloEfficiency(tier.min);
      expect(below / at).toBeLessThan(1.02);
    }
    let previous = soloEfficiency(0);
    for (let v = 0; v <= 45; v += 0.25) {
      const now = soloEfficiency(v);
      expect(now).toBeLessThanOrEqual(previous);
      previous = now;
    }
  });

  it('keeps a hard-work floor up to its grade, and not beyond', () => {
    expect(soloEfficiency(15, TIRELESS)).toBe(0.4);
    expect(soloEfficiency(25, TIRELESS)).toBe(0.4);
    expect(soloEfficiency(2, TIRELESS)).toBe(SOLO_EFFICIENCY.E);
    expect(soloEfficiency(30, TIRELESS)).toBe(SOLO_EFFICIENCY.A);
  });

  it('scales a session by the pace, the grade and the trainee', () => {
    expect(trainingGain(2, 1)).toBeCloseTo(SESSION_PACE, 3);
    expect(trainingGain(2, 1, 2)).toBeCloseTo(2 * SESSION_PACE, 3);
    expect(trainingGain(9, 1)).toBeCloseTo(SESSION_PACE * SOLO_EFFICIENCY.D, 3);
    expect(trainingGain(2, 1, 0)).toBe(0);
  });

  it('applies training only to the trained stats, by their own multipliers', () => {
    const before = createStats(2);
    const after = applyTraining(before, { speed: 1, taijutsu: 1 }, { scale: { taijutsu: 0 } });
    expect(diffStats(before, after)).toEqual({ speed: round2(trainingGain(2, 1)) });
    expect(after.taijutsu).toBe(2);
  });

  it('lets a hard-work floor carry solo training through C', () => {
    const before = createStats(15);
    const plain = applyTraining(before, { taijutsu: 10 });
    const tireless = applyTraining(before, { taijutsu: 10 }, { floors: { taijutsu: TIRELESS } });
    expect(tireless.taijutsu - 15).toBeCloseTo(4 * (plain.taijutsu - 15), 2);
  });
});
