import type { CombatAttributes, CombatTechnique } from '../../contract';
import { empower, empowerEnds } from './empower';
import { canOpen, givesOut, isOpenFor, openStep, stepShare, worthOpening } from './ladders';
import type { EffectUse } from './use';

const attributes: CombatAttributes = {
  strength: 20,
  speed: 20,
  stamina: 20,
  chakraControl: 10,
  intellect: 10,
  perception: 10,
  willpower: 10,
  taijutsu: 20,
  ninjutsu: 10,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

function gate(step: number): EffectUse<'empower'> {
  const effect = {
    verb: 'empower' as const,
    power: 10,
    boosts: ['speed' as const],
    healthPerExchange: 4,
    opens: { ladder: 'gates' as const, step },
  };
  const technique: CombatTechnique = {
    id: `gate-${step}`,
    name: 'Gate',
    discipline: 'taijutsu',
    effects: [effect],
    chakraCost: 8,
  };
  return { technique, effect };
}

const fighter = { attributes, maxChakra: 100, health: 100 };

describe('ladders in a fight', () => {
  it('lifts the stats more with each step, the deep ones beyond any limit', () => {
    const shares = [1, 3, 5, 7, 8].map((step) => stepShare({ ladder: 'gates', step }));
    expect(shares).toEqual([...shares].sort((a, b) => a - b));
    expect(stepShare({ ladder: 'gates', step: 8 })).toBeGreaterThan(1);
  });

  it('climbs: a deeper step replaces the one below, and holds until the body gives out', () => {
    const third = { ...fighter, ...empower(fighter, gate(3), { drive: 20, exchange: 1 }) };
    expect(openStep(third, 'gates')).toBe(3);
    expect(empowerEnds(third, 99)).toBe(false);
    const seventh = { ...third, ...empower(third, gate(7), { drive: 20, exchange: 2 }) };
    expect(openStep(seventh, 'gates')).toBe(7);
    // Replaced, not stacked: the seventh's share of the speed they started with.
    expect(seventh.attributes.speed).toBeCloseTo(
      20 * (1 + stepShare({ ladder: 'gates', step: 7 })),
    );
  });

  it('opens only within reach of the step already open, and gates what needs a step', () => {
    const third = { ...fighter, ...empower(fighter, gate(3), { drive: 20, exchange: 1 }) };
    expect(canOpen({}, gate(7).technique)).toBe(false);
    expect(canOpen(third, gate(7).technique)).toBe(true);
    const tiger = { needsOpen: { ladder: 'gates' as const, step: 7 } };
    expect(isOpenFor(third, tiger)).toBe(false);
    expect(
      isOpenFor({ ...fighter, ...empower(third, gate(7), { drive: 20, exchange: 2 }) }, tiger),
    ).toBe(true);
  });

  it('opens the deep steps only when the fight calls for it, the last only in the last ditch', () => {
    const calm = { outmatched: false, hurt: false, lastDitch: false };
    expect(worthOpening(3, calm)).toBe(true);
    expect(worthOpening(7, calm)).toBe(false);
    expect(worthOpening(7, { ...calm, outmatched: true })).toBe(true);
    expect(worthOpening(8, { ...calm, outmatched: true })).toBe(false);
    expect(worthOpening(8, { ...calm, lastDitch: true })).toBe(true);
  });

  it('gives out once its price has worn the body down', () => {
    expect(givesOut(10, 100)).toBe(true);
    expect(givesOut(40, 100)).toBe(false);
  });
});
