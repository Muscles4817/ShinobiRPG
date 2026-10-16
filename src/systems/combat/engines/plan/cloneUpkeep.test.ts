import type { CombatantSetup } from '../../contract';
import type { Clones } from '../../rules/verbs';
import { clonesAfter } from './cloneUpkeep';
import { initialFighters, type PlanFighter, type Round } from './state';

/** Clones cost their maker chakra each exchange, by kind; earth clones rebuild. */

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

function setup(id: string): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 60,
    maxChakra: 60,
    techniques: [],
  };
}

const solid = (over: Partial<Clones>): Clones => ({
  techniqueId: 'clones',
  count: 4,
  skill: 10,
  strikes: true,
  ...over,
});

function withClones(clones: Clones, chakra = 60): Round {
  const fighters = initialFighters({
    player: setup('maker'),
    allies: [],
    enemies: [setup('foe')],
    canFlee: true,
  }).map((f): PlanFighter => (f.id === 'maker' ? { ...f, clones, chakra } : f));
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

const maker = (r: Round) => r.fighters.find((f) => f.id === 'maker')!;

describe('keeping clones up', () => {
  it('the maker pays each clone’s upkeep, shadow clones most', () => {
    const shadow = maker(clonesAfter(withClones(solid({ kind: 'shadow' }))));
    const water = maker(clonesAfter(withClones(solid({ kind: 'water' }))));
    expect(shadow.chakra).toBeLessThan(water.chakra);
    expect(water.chakra).toBeLessThan(60);
  });

  it('fire clones feed themselves and illusions cost nothing', () => {
    expect(maker(clonesAfter(withClones(solid({ kind: 'fire' })))).chakra).toBe(60);
    const illusions = solid({ kind: 'illusion', strikes: false });
    expect(maker(clonesAfter(withClones(illusions))).chakra).toBe(60);
  });

  it('clones the maker can no longer pay for fade', () => {
    const after = clonesAfter(withClones(solid({ kind: 'shadow' }), 3));
    expect(maker(after).clones?.count).toBe(2);
    expect(after.lines.at(-1)).toMatch(/clones fade/);
  });

  it('an earth clone that burst heaves back up, never past what was made', () => {
    const short = clonesAfter(withClones(solid({ kind: 'earth', count: 2, made: 4 })));
    expect(maker(short).clones?.count).toBe(3);
    const full = clonesAfter(withClones(solid({ kind: 'earth', count: 4, made: 4 })));
    expect(maker(full).clones?.count).toBe(4);
    const shadow = clonesAfter(withClones(solid({ kind: 'shadow', count: 2, made: 4 })));
    expect(maker(shadow).clones?.count).toBe(2);
  });
});
