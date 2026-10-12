import { createRng } from '@/core';

import { APTITUDE_MAX, aptitudeBand, nothingKnown, rollAptitude, rollOne } from './aptitude';
import { STAT_IDS } from './stats';

describe('aptitude', () => {
  it('rolls between floor and ceiling, deterministically for a seed', () => {
    const odds = { floor: 0.9, ceiling: 1.1 };
    for (let seed = 0; seed < 200; seed++) {
      const value = rollOne(createRng(seed), odds);
      expect(value).toBeGreaterThanOrEqual(0.9);
      expect(value).toBeLessThanOrEqual(1.1);
    }
    expect(rollAptitude(createRng(7), () => odds)).toEqual(rollAptitude(createRng(7), () => odds));
  });

  it('turns up prodigies and holes at about their chances', () => {
    const odds = { floor: 0.8, ceiling: 1.2, prodigy: 0.1, hole: 0.2 };
    const rolls = Array.from({ length: 2000 }, (_, seed) => rollOne(createRng(seed), odds));
    const prodigies = rolls.filter((v) => v >= 1.4).length / rolls.length;
    const holes = rolls.filter((v) => v <= 0.55).length / rolls.length;
    expect(prodigies).toBeGreaterThan(0.07);
    expect(prodigies).toBeLessThan(0.13);
    expect(holes).toBeGreaterThan(0.16);
    expect(holes).toBeLessThan(0.24);
  });

  it('tilts, floors and caps a roll', () => {
    expect(rollOne(createRng(1), { floor: 1, ceiling: 1, tilt: 1.5 })).toBe(1.5);
    expect(rollOne(createRng(1), { floor: 0.3, ceiling: 0.3, atLeast: 1 })).toBe(1);
    expect(rollOne(createRng(1), { floor: 1.7, ceiling: 1.7, tilt: 2 })).toBe(APTITUDE_MAX);
  });

  it('reads as a rough band', () => {
    expect(aptitudeBand(0)).toBe('none');
    expect(aptitudeBand(0.5)).toBe('poor');
    expect(aptitudeBand(1)).toBe('ordinary');
    expect(aptitudeBand(1.6)).toBe('gifted');
  });

  it('starts with nothing known about any stat', () => {
    expect(Object.keys(nothingKnown())).toEqual([...STAT_IDS]);
    expect(new Set(Object.values(nothingKnown()))).toEqual(new Set(['unknown']));
  });
});
