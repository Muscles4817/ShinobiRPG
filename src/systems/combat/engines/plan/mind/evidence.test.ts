import { confidence, faded, NO_EVIDENCE, surenessOf, weighed } from './evidence';

/** Confidence from evidence (`evidence.ts`): sharper minds move off a prior sooner and forget sooner. */

const dull = { attributes: { intellect: 5 } };
const sharp = { attributes: { intellect: 45 } };

describe('confidence from evidence', () => {
  it('is the prior with no evidence', () => {
    expect(confidence(dull, NO_EVIDENCE, 0.25)).toBeCloseTo(0.25);
    expect(confidence(sharp, NO_EVIDENCE, 0.25)).toBeCloseTo(0.25);
  });

  it('moves a sharp mind further on the same evidence', () => {
    const three = { seen: 3, against: 0, at: 0 };
    expect(confidence(sharp, three, 0.25)).toBeGreaterThan(confidence(dull, three, 0.25));
  });

  it('weighs evidence against as well as for', () => {
    const mixed = { seen: 3, against: 3, at: 0 };
    expect(confidence(sharp, mixed, 0.25)).toBeLessThan(0.6);
    const added = weighed(sharp, NO_EVIDENCE, { weight: -2, now: 1 });
    expect(added).toEqual({ seen: 0, against: 2, at: 1 });
  });

  it('fades old evidence, a sharp mind faster', () => {
    const old = { seen: 4, against: 0, at: 0 };
    expect(faded(sharp, old, 10).seen).toBeLessThan(faded(dull, old, 10).seen);
    expect(faded(dull, old, 0).seen).toBe(4);
  });

  it('says confidence in graded words', () => {
    expect(surenessOf(0.95)).toBe('sure');
    expect(surenessOf(0.7)).toBe('fairly sure');
    expect(surenessOf(0.5)).toBe('maybe');
  });
});
