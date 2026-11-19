import type { CombatantSetup, CombatTechnique } from '../../contract';
import { closingOn, stagesAfter } from './stages';
import { initialFighters, type PlanFighter, type Round } from './state';

/** A pull, then the crush: the second stage closes only on whoever is still held. */

const attributes = {
  strength: 20,
  speed: 20,
  stamina: 20,
  chakraControl: 20,
  intellect: 20,
  perception: 20,
  willpower: 20,
  taijutsu: 20,
  ninjutsu: 20,
  genjutsu: 20,
  kenjutsu: 20,
  fuuinjutsu: 20,
};

const devastation: CombatTechnique = {
  id: 'devastation',
  name: 'Devastation',
  discipline: 'ninjutsu',
  effects: [{ verb: 'pin', power: 20 }],
  then: [{ verb: 'damage', power: 30 }],
  chakraCost: 0,
};

const setup = (id: string, techniques: CombatTechnique[] = []): CombatantSetup => ({
  id,
  name: id,
  attributes,
  health: 100,
  maxHealth: 100,
  chakra: 100,
  maxChakra: 100,
  techniques,
});

function cast(pinned: boolean): Round {
  const [caster, target] = initialFighters({
    player: setup('pain', [devastation]),
    allies: [],
    enemies: [setup('foe')],
    canFlee: true,
  });
  const held: PlanFighter = pinned ? { ...target!, pinned: 3 } : target!;
  const round: Round = {
    number: 1,
    fighters: [caster!, held],
    range: 'mid',
    lines: [],
    seen: {},
    intents: {},
  };
  return closingOn(round, { by: 'pain', targetId: 'foe', technique: devastation });
}

const foe = (r: Round) => r.fighters.find((f) => f.id === 'foe')!;

describe('two-stage techniques', () => {
  it('close at the end of the next exchange on a target still held', () => {
    const first = stagesAfter(cast(true));
    expect(foe(first).health).toBe(100);
    expect(foe(first).closing?.armed).toBe(true);
    const second = stagesAfter(first);
    expect(foe(second).health).toBeLessThan(100);
    expect(foe(second).closing).toBeUndefined();
  });

  it('miss whoever broke free in between', () => {
    const first = stagesAfter(cast(true));
    const free = {
      ...first,
      fighters: first.fighters.map((f) => (f.id === 'foe' ? { ...f, pinned: 0 } : f)),
    };
    const second = stagesAfter(free);
    expect(foe(second).health).toBe(100);
    expect(foe(second).closing).toBeUndefined();
    expect(second.lines.some((l) => l.includes('free before it closes'))).toBe(true);
  });
});
