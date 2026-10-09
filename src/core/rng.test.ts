import { createRng } from './rng';

describe('createRng', () => {
  it('is deterministic for a given seed', () => {
    const a = createRng(42);
    const b = createRng(42);
    const seqA = Array.from({ length: 5 }, () => a.next());
    const seqB = Array.from({ length: 5 }, () => b.next());
    expect(seqA).toEqual(seqB);
  });

  it('resumes the same sequence from a saved state', () => {
    const rng = createRng(7);
    rng.next();
    const resumed = createRng(rng.state());
    expect(resumed.next()).toBe(rng.next());
  });

  it('produces integers within inclusive bounds', () => {
    const rng = createRng(1);
    for (let i = 0; i < 500; i++) {
      const n = rng.int(3, 6);
      expect(n).toBeGreaterThanOrEqual(3);
      expect(n).toBeLessThanOrEqual(6);
    }
  });

  it('throws when picking from an empty array', () => {
    expect(() => createRng(1).pick([])).toThrow();
  });
});
