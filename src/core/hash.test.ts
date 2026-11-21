import { drawUnit, freshIndex, hashString, hashUnit } from './hash';

describe('hash', () => {
  it('is stable and spreads values', () => {
    expect(hashString('patrol')).toBe(hashString('patrol'));
    expect(hashString('patrol')).not.toBe(hashString('patrols'));
    const values = Array.from({ length: 200 }, (_, i) => hashUnit(7, i, 'job'));
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...values)).toBeLessThan(1);
    expect(values.filter((v) => v < 0.5).length).toBeGreaterThan(70);
    expect(values.filter((v) => v < 0.5).length).toBeLessThan(130);
  });
});

describe('drawUnit', () => {
  const SEEDS = 4000;

  it('gives draws whose keys differ only at the end independent values', () => {
    const pairs = Array.from({ length: SEEDS }, (_, seed) => [
      Math.floor(drawUnit(seed, 9, 'table', 0, 0) * 6),
      Math.floor(drawUnit(seed, 9, 'table', 0, 1) * 6),
    ]);
    const matching = pairs.filter(([a, b]) => a === b).length / SEEDS;
    // Two fair dice match one time in six.
    expect(matching).toBeGreaterThan(0.13);
    expect(matching).toBeLessThan(0.2);
  });

  it('spreads values over [0, 1)', () => {
    const values = Array.from({ length: SEEDS }, (_, i) => drawUnit(3, i));
    expect(Math.min(...values)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...values)).toBeLessThan(1);
    const low = values.filter((v) => v < 0.5).length / SEEDS;
    expect(low).toBeGreaterThan(0.46);
    expect(low).toBeLessThan(0.54);
  });
});

describe('freshIndex', () => {
  it('is the hashed pick when nothing was said lately', () => {
    expect(freshIndex('k', 5, [])).toBe(hashString('k') % 5);
  });

  it('passes over lines said lately, and repeats only when all were', () => {
    const first = freshIndex('k', 3, []);
    const second = freshIndex('k', 3, [first]);
    expect(second).not.toBe(first);
    const third = freshIndex('k', 3, [first, second]);
    expect(new Set([first, second, third]).size).toBe(3);
    expect(freshIndex('k', 3, [0, 1, 2])).toBe(first);
  });
});
