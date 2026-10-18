import type { CombatantSetup, CombatAttributes, CombatTechnique } from '../../contract';
import { initialFighters, type PlanFighter } from './state';
import { cardWorth } from './worth';

/** What an attack is worth against a foe, as instinct reckons it. */

const attributes: CombatAttributes = {
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
  chakraCost: 6,
  effects: [{ verb: 'damage', power: 12 }],
};
const feint: CombatTechnique = {
  id: 'feint',
  name: 'Feint',
  discipline: 'taijutsu',
  chakraCost: 4,
  effects: [{ verb: 'daze', power: 6 }],
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
    techniques: [bolt, feint],
    ...over,
  };
}

function pair(
  self: Partial<CombatantSetup>,
  foe: Partial<CombatantSetup>,
): [PlanFighter, PlanFighter] {
  const [a, b] = initialFighters({
    player: setup('self', self),
    allies: [],
    enemies: [setup('foe', foe)],
    canFlee: true,
  });
  return [a!, b!];
}

function worth(card: Parameters<typeof cardWorth>[2], self = {}, foe = {}): number {
  const [me, them] = pair(self, foe);
  return cardWorth(me, them, card, { band: 'mid', fighters: [me, them] }) ?? -1;
}

const jutsu = (technique: CombatTechnique) => ({ kind: 'jutsu', technique }) as const;

describe('what an attack is worth', () => {
  it('less against a foe who slips it more often', () => {
    const quick = { attributes: { ...attributes, speed: 30, perception: 30 } };
    expect(worth(jutsu(bolt), {}, quick)).toBeLessThan(worth(jutsu(bolt)));
  });

  it('a hold is worth less against a foe it won’t take hold of', () => {
    const hardy = { attributes: { ...attributes, stamina: 40 } };
    expect(worth(jutsu(feint), {}, hardy)).toBeLessThan(worth(jutsu(feint)));
  });

  it('a technique is worth less to someone nearly out of chakra', () => {
    expect(worth(jutsu(bolt), { chakra: 8 })).toBeLessThan(worth(jutsu(bolt)));
  });

  it('plain blows are reckoned too, and anything that isn’t an attack is not', () => {
    expect(worth({ kind: 'throw' })).toBeGreaterThan(0);
    const [me, them] = pair({}, {});
    expect(cardWorth(me, them, { kind: 'guard' }, { band: 'mid', fighters: [] })).toBeNull();
  });
});
