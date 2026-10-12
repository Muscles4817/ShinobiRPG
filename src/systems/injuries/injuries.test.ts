import { createRng } from '@/core';

import {
  addExhaustion,
  chakraAfterSleep,
  healedBy,
  isDrained,
  isExhausted,
  pickInjury,
  recoveryDays,
  treat,
} from './injuries';

describe('injury recovery', () => {
  it('stamina shortens a new injury, but never below a day or past half', () => {
    expect(recoveryDays(10, 0)).toBe(10);
    expect(recoveryDays(10, 20)).toBe(8);
    expect(recoveryDays(10, 200)).toBe(5);
    expect(recoveryDays(1, 40)).toBe(1);
  });

  it('heals on the morning of its last day', () => {
    const injuries = [
      { injuryId: 'a', until: 5 },
      { injuryId: 'b', until: 7 },
    ];
    const { hurting, healed } = healedBy(injuries, 5);
    expect(hurting.map((i) => i.injuryId)).toEqual(['b']);
    expect(healed.map((i) => i.injuryId)).toEqual(['a']);
  });

  it('treatment halves the days left, once', () => {
    const treated = treat({ injuryId: 'a', until: 11 }, 3);
    expect(treated).toEqual({ injuryId: 'a', until: 7, treated: true });
    expect(treat(treated, 3)).toBe(treated);
    expect(treat({ injuryId: 'b', until: 4 }, 3).until).toBe(4);
  });
});

describe('which injury a beating leaves', () => {
  const candidates = [
    { id: 'bruise', days: 1 },
    { id: 'broken', days: 8 },
  ];

  function share(beating: number): number {
    const rng = createRng(7);
    const picks = Array.from({ length: 400 }, () => pickInjury(candidates, beating, rng));
    return picks.filter((p) => p === 'broken').length / picks.length;
  }

  it('a narrow loss tends to leave a light injury, a rout a heavy one', () => {
    expect(share(0)).toBeLessThan(0.25);
    expect(share(0.5)).toBeGreaterThan(0.35);
    expect(share(0.5)).toBeLessThan(0.65);
    expect(share(1)).toBeGreaterThan(0.75);
  });

  it('has nothing to pick from an empty list', () => {
    expect(pickInjury([], 1, createRng(1))).toBeNull();
  });
});

describe('chakra exhaustion', () => {
  it('starts when a fight ends nearly drained', () => {
    expect(isDrained(4, 50)).toBe(true);
    expect(isDrained(5, 50)).toBe(false);
  });

  it('keeps the later end and the poorer refill', () => {
    const merged = addExhaustion({ until: 4, refill: 0.5 }, { until: 6, refill: 0.7 });
    expect(merged).toEqual({ until: 6, refill: 0.5 });
    expect(isExhausted(merged, 5)).toBe(true);
    expect(isExhausted(merged, 6)).toBe(false);
  });

  it('a sleep begun while exhausted refills only part of your chakra', () => {
    const state = { until: 4, refill: 0.5 };
    expect(chakraAfterSleep({ chakra: 2 }, 60, { state, day: 3 })).toBe(30);
    expect(chakraAfterSleep({ chakra: 40 }, 60, { state, day: 3 })).toBe(40);
    expect(chakraAfterSleep({ chakra: 2 }, 60, { state, day: 4 })).toBe(60);
    expect(chakraAfterSleep({ chakra: 2 }, 60, { state: null, day: 3 })).toBe(60);
  });
});
