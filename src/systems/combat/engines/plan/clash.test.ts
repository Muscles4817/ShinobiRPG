import { createRng } from '@/core';

import { hitsOn } from '@/test/fightLines';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { useJutsu } from './jutsu';
import { fighterIn, initialFighters, type Round } from './state';

const attributes = {
  strength: 10,
  speed: 10,
  stamina: 20,
  chakraControl: 10,
  intellect: 10,
  perception: 1,
  willpower: 10,
  taijutsu: 10,
  ninjutsu: 20,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const bolt = (id: string, element: NonNullable<CombatTechnique['element']>): CombatTechnique => ({
  id,
  name: id,
  discipline: 'ninjutsu',
  element,
  effects: [{ verb: 'damage', power: 14 }],
  chakraCost: 6,
  reach: ['close', 'mid', 'far'],
});
const fireball = bolt('Fireball', 'fire');
const waterBullet = bolt('Water Bullet', 'water');
const gale = bolt('Gale', 'wind');
const ember = bolt('Ember', 'fire');
const waterWall: CombatTechnique = {
  id: 'wall',
  name: 'Water Wall',
  discipline: 'ninjutsu',
  element: 'water',
  effects: [{ verb: 'substitute', power: 12 }],
  chakraCost: 8,
};
const quake = bolt('Quake', 'earth');

function setup(id: string, overrides: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 60,
    maxChakra: 60,
    techniques: [],
    ...overrides,
  };
}

/** The hero against a bandit who knows this technique and means to throw it next. */
function facing(
  answer: CombatTechnique,
  intends = true,
  bandit: Partial<CombatantSetup> = {},
): Round {
  const fighters = initialFighters({
    player: setup('hero', { techniques: [fireball, quake] }),
    allies: [],
    enemies: [setup('bandit', { techniques: [answer], ...bandit })],
    canFlee: true,
  });
  return {
    number: 1,
    fighters,
    range: 'mid',
    lines: [],
    seen: {},
    intents: intends ? { bandit: `jutsu:${answer.id}` } : {},
  };
}

/** The hero throws a technique at the bandit, with each seed until the narration matches. */
function throwUntil(round: Round, t: CombatTechnique, wanted: RegExp): Round {
  for (let seed = 1; seed < 200; seed++) {
    const [hero, bandit] = round.fighters;
    const after = useJutsu(round, { actor: hero!, target: bandit, rng: createRng(seed) }, t);
    if (after.lines.some((l) => wanted.test(l))) return after;
  }
  throw new Error(`no seed narrates ${wanted.source}`);
}

describe('clashes', () => {
  it('an answer the element overpowers swallows the attack and carries on, weakened', () => {
    const after = throwUntil(facing(waterBullet), fireball, /swallows Fireball/);
    expect(fighterIn(after, 'hero')?.health).toBeLessThan(100);
    expect(fighterIn(after, 'bandit')?.health).toBe(100);
    expect(after.acted).toContain('bandit');
  });

  it('an attack that overpowers the answer goes through to its target', () => {
    const after = throwUntil(facing(gale), fireball, /overwhelms Gale/);
    expect(fighterIn(after, 'bandit')?.health).toBeLessThan(100);
  });

  it('between even elements, the clearly stronger technique drives through, weakened', () => {
    const weak = { attributes: { ...attributes, ninjutsu: 5 } };
    const after = throwUntil(facing(ember, true, weak), fireball, /Fireball drives through Ember/);
    expect(fighterIn(after, 'bandit')?.health).toBeLessThan(100);
  });

  it('even elements close in strength burst against each other', () => {
    const after = throwUntil(facing(ember), fireball, /burst against each other/);
    expect(fighterIn(after, 'bandit')?.health).toBe(100);
    expect(fighterIn(after, 'hero')?.health).toBe(100);
  });

  it('no clash without an elemental attack about to come back', () => {
    const after = throwUntil(facing(waterBullet, false), fireball, hitsOn('bandit'));
    expect(after.lines.join(' ')).not.toMatch(/meets it/);
  });
});

describe('elemental walls', () => {
  function walled(): Round {
    const round = facing(waterWall, false);
    const reactions = { close: 'jutsu:wall', mid: 'jutsu:wall', far: 'jutsu:wall' };
    return {
      ...round,
      fighters: round.fighters.map((f) => (f.id === 'bandit' ? { ...f, reactions } : f)),
    };
  }

  it('a wall swallows an element it overpowers and still stands', () => {
    const after = throwUntil(walled(), fireball, /swallows hero['’]s Fireball and still stands/);
    expect(fighterIn(after, 'bandit')).toMatchObject({ health: 100 });
    expect(fighterIn(after, 'bandit')?.substituteSpent).toBeUndefined();
  });

  it('an element that overpowers the wall smashes through it', () => {
    const after = throwUntil(walled(), quake, /smashes through Water Wall/);
    expect(fighterIn(after, 'bandit')?.health).toBeLessThan(100);
    expect(fighterIn(after, 'bandit')?.substituteSpent).toBe(true);
  });
});
