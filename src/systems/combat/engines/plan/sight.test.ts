import type { CombatantSetup, CombatTechnique } from '../../contract';
import { avoidOdds, techniqueIncoming } from './avoid';
import { initialFighters, type PlanFighter, type Round } from './state';

/** In the fight: a technique from someone unseen is slipped less; one from far off, more. */

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

const setup = (id: string): CombatantSetup => ({
  id,
  name: id,
  attributes,
  health: 100,
  maxHealth: 100,
  chakra: 100,
  maxChakra: 100,
  techniques: [],
});

const sand: CombatTechnique = {
  id: 'sand',
  name: 'Sand Coffin',
  discipline: 'ninjutsu',
  tags: { delivery: ['from-ground'] },
  reach: ['close', 'mid', 'far'],
  effects: [{ verb: 'damage', power: 16 }],
  chakraCost: 0,
};

const [caster, target] = initialFighters({
  player: setup('caster'),
  allies: [],
  enemies: [setup('target')],
  canFlee: true,
});

function odds(attacker: PlanFighter, range: Round['range']): number {
  const round: Round = {
    number: 1,
    fighters: [attacker, target!],
    range,
    lines: [],
    seen: {},
    intents: {},
  };
  return avoidOdds(round, techniqueIncoming(attacker, target!, sand, round)!);
}

describe('what you can see in a fight', () => {
  it('slips a technique from someone hidden less often', () => {
    expect(odds({ ...caster!, hidden: true }, 'mid')).toBeLessThan(odds(caster!, 'mid'));
  });

  it('slips a technique that travels more often the further it comes', () => {
    expect(odds(caster!, 'far')).toBeGreaterThan(odds(caster!, 'close'));
  });
});
