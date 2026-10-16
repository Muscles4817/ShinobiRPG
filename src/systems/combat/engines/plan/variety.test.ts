import type { CombatantSetup, CombatTechnique } from '../../contract';
import { plannedPlay } from './priority';
import { initialFighters, type PlanFighter, type Round } from './state';

/** A fighter who reads the fight changes up an attack they've leaned on, against a foe who'd notice. */

const sharp = {
  strength: 20,
  speed: 20,
  stamina: 20,
  chakraControl: 20,
  intellect: 40,
  perception: 20,
  willpower: 20,
  taijutsu: 20,
  ninjutsu: 30,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

function jutsu(id: string, power: number): CombatTechnique {
  return {
    id,
    name: id,
    discipline: 'ninjutsu',
    reach: ['mid'],
    effects: [{ verb: 'damage', power }],
    chakraCost: 5,
  };
}
const bolt = jutsu('bolt', 20);
const gust = jutsu('gust', 14);

function setup(id: string, intellect: number): CombatantSetup {
  return {
    id,
    name: id,
    attributes: { ...sharp, intellect },
    health: 100,
    maxHealth: 100,
    chakra: 80,
    maxChakra: 80,
    techniques: [bolt, gust],
  };
}

function round(foeIntellect: number, turns: number, watching = false): Round {
  const fighters = initialFighters({
    player: setup('foe', foeIntellect),
    allies: [],
    enemies: [setup('caster', 40)],
    canFlee: true,
  }).map((f): PlanFighter =>
    f.id === 'caster'
      ? {
          ...f,
          loadout: { close: [], mid: [{ card: 'jutsu:bolt' }, { card: 'jutsu:gust' }], far: [] },
          streak: { card: 'jutsu:bolt', turns },
        }
      : f,
  );
  return {
    number: 3,
    fighters,
    range: 'mid',
    lines: [],
    seen: {},
    intents: {},
    ...(watching ? { watching: true as const } : {}),
  };
}

const played = (r: Round) => {
  const play = plannedPlay(
    r.fighters.find((f) => f.id === 'caster')!,
    r,
  );
  return play.card.kind === 'jutsu' ? play.card.technique.id : play.card.kind;
};

describe('changing up', () => {
  it('changes up an attack played turns running against a foe who reads the fight', () => {
    expect(played(round(40, 2))).toBe('gust');
  });

  it('keeps to the plan before it has leaned on it, or against a foe who wouldn’t notice', () => {
    expect(played(round(40, 1))).toBe('bolt');
    expect(played(round(5, 3))).toBe('bolt');
  });
});
