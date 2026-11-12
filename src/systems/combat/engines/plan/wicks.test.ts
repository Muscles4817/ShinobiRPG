import type { CombatantSetup, CombatTechnique } from '../../contract';
import { openStep } from '../../rules/verbs';
import { playable } from './cards';
import { afterEmpowers, empowerSelf } from './empower';
import { prepStatuses } from './prep';
import { initialFighters, type PlanFighter, type Round } from './state';

/** The wicks in a planned fight: lit a band at a time, gating their arts, and guttering out. */

const attributes = {
  strength: 20,
  speed: 20,
  stamina: 20,
  chakraControl: 10,
  intellect: 30,
  perception: 10,
  willpower: 10,
  taijutsu: 25,
  ninjutsu: 5,
  genjutsu: 5,
  kenjutsu: 5,
  fuuinjutsu: 5,
};

function opener(id: string, step: number): CombatTechnique {
  return {
    id,
    name: id,
    discipline: 'taijutsu',
    effects: [
      {
        verb: 'empower',
        power: 10,
        boosts: ['strength', 'speed'],
        opens: { ladder: 'wicks', step },
      },
    ],
    chakraCost: 8,
  };
}
const third = opener('third', 3);
const sixth = opener('sixth', 6);
const heel: CombatTechnique = {
  id: 'heel',
  name: 'Heel',
  discipline: 'taijutsu',
  needsOpen: { ladder: 'wicks', step: 3 },
  effects: [{ verb: 'damage', power: 20 }],
  chakraCost: 10,
};

function setup(id: string, techniques: CombatTechnique[] = []): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 40,
    maxChakra: 80,
    techniques,
  };
}

function round(): Round {
  const fighters = initialFighters({
    player: setup('monk', [third, sixth, heel]),
    allies: [],
    enemies: [setup('foe')],
    canFlee: true,
  });
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

const use = (t: CombatTechnique) => ({ technique: t, effect: t.effects[0] as never });
const monk = (r: Round): PlanFighter => r.fighters.find((f) => f.id === 'monk')!;

describe('the wicks', () => {
  it('lights the third and then the sixth, told as wicks', () => {
    const lit = empowerSelf(round(), monk(round()), use(third));
    expect(openStep(monk(lit), 'wicks')).toBe(3);
    expect(prepStatuses(monk(lit))).toContain('Third wick open');
    expect(lit.lines.at(-1)).toMatch(/lights the third wick/);
    const deeper = empowerSelf(lit, monk(lit), use(sixth));
    expect(openStep(monk(deeper), 'wicks')).toBe(6);
  });

  it('keeps a wick art shut until its wick is lit', () => {
    const card = { kind: 'jutsu' as const, technique: heel };
    expect(playable(monk(round()), card)).toBe(false);
    const lit = empowerSelf(round(), monk(round()), use(third));
    expect(playable(monk(lit), card)).toBe(true);
  });

  it('burns health while lit, and gutters out when the body gives out', () => {
    const lit = empowerSelf(round(), monk(round()), use(third));
    expect(monk(afterEmpowers(lit, 2)).health).toBeLessThan(100);
    const spent = { ...lit, fighters: lit.fighters.map((f) => ({ ...f, breath: 1 })) };
    const after = afterEmpowers(spent, 2);
    expect(monk(after).empowered).toBeUndefined();
    expect(after.lines.join(' ')).toMatch(/wicks gutter out/);
  });
});
