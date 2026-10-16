import type { CombatantSetup, CombatTechnique, RangeBand } from '../../contract';
import { avoidOdds, techniqueIncoming } from './avoid';
import { initialFighters, type Round } from './state';

/** The avoid roll as a planned fight sees it. */

const attributes = {
  strength: 10,
  speed: 10,
  stamina: 10,
  chakraControl: 10,
  intellect: 10,
  perception: 10,
  willpower: 10,
  taijutsu: 10,
  ninjutsu: 10,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const bolt: CombatTechnique = {
  id: 'bolt',
  name: 'Bolt',
  discipline: 'ninjutsu',
  chakraCost: 4,
  effects: [{ verb: 'damage', power: 10 }],
};

function setup(id: string, over: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 60,
    maxChakra: 60,
    techniques: [bolt],
    ...over,
  };
}

function odds(caster: Partial<CombatantSetup>, range: RangeBand): number {
  const fighters = initialFighters({
    player: setup('caster', caster),
    allies: [],
    enemies: [setup('foe')],
    canFlee: true,
  });
  const round: Round = { number: 1, fighters, range, lines: [], seen: {}, intents: {} };
  const [actor, target] = fighters;
  const incoming = techniqueIncoming(actor!, target!, bolt, range);
  return incoming ? avoidOdds(round, incoming) : 0;
}

describe('the avoid roll in a planned fight', () => {
  it('signs made around a drawn blade are slipped more often, short of far', () => {
    const blade = { gear: { held: { name: 'Tanto', shape: 'blade', rank: 'D' } } } as const;
    const bare = { gear: {} };
    expect(odds(blade, 'close')).toBeGreaterThan(odds(bare, 'close'));
    expect(odds(blade, 'mid')).toBeGreaterThan(odds(bare, 'mid'));
    expect(odds(blade, 'far')).toBeCloseTo(odds(bare, 'far'));
  });
});
