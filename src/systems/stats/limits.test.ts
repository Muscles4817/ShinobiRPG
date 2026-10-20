import { evenAptitude } from './aptitude';
import { applyTraining } from './growth';
import {
  BULK_SPEED_COST,
  effectiveLimits,
  limitFactor,
  limitOf,
  limitRead,
  limitsFor,
  PAST_LIMIT_TRICKLE,
} from './limits';
import { createStats } from './stats';

describe('natural limits', () => {
  it('hold born and frame stats near chūnin for most, and the arts far wider', () => {
    expect(limitOf('born', 1)).toBe(17);
    expect(limitOf('frame', 1.3)).toBe(26);
    expect(limitOf('born', 1.6)).toBe(36);
    expect(limitOf('trained', 1)).toBe(32);
    expect(limitOf('trained', 0)).toBe(0);
    expect(limitOf('born', 0.75)).toBeGreaterThan(limitOf('born', 0.5));
  });

  it('grow the body and mind from where someone started', () => {
    const start = createStats(5, { speed: 5, strength: 5, intellect: 7 });
    const limits = limitsFor(evenAptitude(1), {}, start);
    // Speed has about a grade left in a grown body; strength and stamina about two.
    expect(limits.speed).toBe(15);
    expect(limits.strength).toBe(21);
    expect(limits.stamina).toBe(10);
    expect(limits.intellect).toBe(16);
    // Skills go as far as talent takes them, wherever they began.
    expect(limits.taijutsu).toBe(limitOf('trained', 1));
    // No talent at all: the body stays as it is.
    expect(limitsFor(evenAptitude(0), {}, start).speed).toBe(10);
  });

  it('let growth run, ease near the limit, and trickle past it', () => {
    expect(limitFactor(10, 17)).toBe(1);
    expect(limitFactor(15.5, 17)).toBeLessThan(1);
    expect(limitFactor(15.5, 17)).toBeGreaterThan(PAST_LIMIT_TRICKLE);
    expect(limitFactor(17, 17)).toBe(PAST_LIMIT_TRICKLE);
    expect(limitFactor(25, 17)).toBe(PAST_LIMIT_TRICKLE);
  });

  it('are moved by a frame or a breakthrough', () => {
    const limits = limitsFor(evenAptitude(1), { speed: 6, strength: -6 });
    expect(limits.speed).toBe(23);
    expect(limits.strength).toBe(11);
    expect(limitsFor(evenAptitude(0), { speed: 6 }).speed).toBe(0);
  });

  it('slow you down once you carry more strength than your frame was built for', () => {
    const limits = limitsFor(evenAptitude(1));
    const strong = createStats(10, { strength: 19 - 10 });
    expect(effectiveLimits(limits, strong, 13).speed).toBe(17 - 6 * BULK_SPEED_COST);
    expect(effectiveLimits(limits, strong, 20).speed).toBe(17);
  });

  it('stop training at the limit, and teachers do not carry you past it', () => {
    const limits = limitsFor(evenAptitude(1));
    const atLimit = createStats(5, { speed: 12 });
    const growth = { limits };
    const held = applyTraining(atLimit, { speed: 10 }, growth).speed - atLimit.speed;
    const free = applyTraining(atLimit, { speed: 10 }).speed - atLimit.speed;
    expect(held).toBeCloseTo(free * PAST_LIMIT_TRICKLE, 3);
    const taught = applyTraining(atLimit, { speed: 10 }, { ...growth, teachers: { speed: 30 } });
    const freely = applyTraining(atLimit, { speed: 10 }, { teachers: { speed: 30 } });
    expect(taught.speed - atLimit.speed).toBeLessThan((freely.speed - atLimit.speed) * 0.1);
  });

  it('read as open, near or reached', () => {
    expect(limitRead(10, 17)).toBe('open');
    expect(limitRead(15, 17)).toBe('near');
    expect(limitRead(17, 17)).toBe('reached');
  });
});
