import type { CombatantSetup } from '../../contract';
import { climbReasons, TRY_ATTACKS } from './climbing';
import { initialFighters, type PlanFighter, type Reads } from './state';

/** When the fight has shown a fighter that their style isn't enough. */

const attributes = {
  strength: 20,
  speed: 20,
  stamina: 20,
  chakraControl: 10,
  intellect: 20,
  perception: 10,
  willpower: 10,
  taijutsu: 25,
  ninjutsu: 5,
  genjutsu: 5,
  kenjutsu: 5,
  fuuinjutsu: 5,
};

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 40,
    maxChakra: 80,
    techniques: [],
    ...overrides,
  };
}

function pair(foe: Partial<CombatantSetup> = {}): [PlanFighter, PlanFighter] {
  const [self, other] = initialFighters({
    player: setup('guy'),
    allies: [],
    enemies: [setup('foe', foe)],
    canFlee: true,
  });
  return [self!, other!];
}

const tried: Reads = {
  guy: { defences: {}, attacks: { blow: TRY_ATTACKS } },
};

describe('climbing on what the fight shows', () => {
  it('a fresh fight against an equal gives no reason to climb', () => {
    const [self, foe] = pair();
    expect(climbReasons(self, { foes: [foe] })).toEqual({
      losing: false,
      cantHurt: false,
      hurt: false,
      lastDitch: false,
      settled: true,
    });
  });

  it('sharp eyes size up a far stronger foe at sight; dull ones must try first', () => {
    const strong = { ...attributes, taijutsu: 50, strength: 40, speed: 40, perception: 5 };
    const [self, foe] = pair({ attributes: strong });
    expect(climbReasons(self, { foes: [foe] }).losing).toBe(true);
    const keen = { ...strong, perception: 30 };
    const [dull, sharpFoe] = pair({ attributes: keen });
    expect(climbReasons(dull, { foes: [sharpFoe] }).losing).toBe(false);
  });

  it('after trying, a trade going against them, or blows that barely touch the foe', () => {
    const [self, foe] = pair();
    const hurt = { ...self, health: 60 };
    expect(climbReasons(hurt, { foes: [foe] }).losing).toBe(false);
    const reasons = climbReasons(hurt, { foes: [foe], reads: tried });
    expect(reasons.losing).toBe(true);
    expect(reasons.cantHurt).toBe(true);
    expect(climbReasons(hurt, { foes: [{ ...foe, health: 50 }], reads: tried })).toMatchObject({
      losing: false,
      cantHurt: false,
    });
  });

  it('a gate open now must be fought with before it is judged', () => {
    const [self, foe] = pair();
    const opened = {
      ...self,
      empowered: {
        techniqueId: 'life',
        added: {},
        opened: { ladder: 'gates' as const, step: 3 },
        since: 4,
        healthPerExchange: 0,
      },
    };
    expect(climbReasons(opened, { foes: [foe], exchange: 5 }).settled).toBe(false);
    expect(climbReasons(opened, { foes: [foe], exchange: 6 }).settled).toBe(true);
  });
});
