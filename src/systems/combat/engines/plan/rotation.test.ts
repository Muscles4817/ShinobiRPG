import { createRng, type Rng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { avoidOdds } from './avoid';
import { spunAway } from './footwork';
import { react, type Blow } from './react';
import { defaultReactions } from './readiness';
import { fighterIn, initialFighters, type Round } from './state';

/** A spin (Palm Rotation): it turns every hit and hold aside, for chakra, never an illusion. */

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

const ROTATION: CombatTechnique = {
  id: 'rotation',
  name: 'Rotation',
  discipline: 'taijutsu',
  effects: [{ verb: 'substitute', power: 14, spins: true }],
  chakraCost: 6,
};

/** Nothing is slipped: every blow gets as far as the ready defence. */
const NO_LUCK: Rng = { ...createRng(1), chance: () => false, next: () => 0.5 };

function setup(id: string, over: Partial<CombatantSetup> = {}): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 60,
    maxChakra: 60,
    techniques: [],
    ...over,
  };
}

function round(spinner: Partial<CombatantSetup>): Round {
  const fighters = initialFighters({
    player: setup('neji', { techniques: [ROTATION], ...spinner }),
    allies: [],
    enemies: [setup('foe')],
    canFlee: true,
  });
  // The spin kept ready at every distance, as a plan keeps it by default.
  const ready = fighters.map((f) =>
    f.id === 'neji' ? { ...f, reactions: defaultReactions(f) } : f,
  );
  return { number: 1, fighters: ready, range: 'mid', lines: [], seen: {}, intents: {} };
}

const neji = (r: Round) => fighterIn(r, 'neji')!;
const foe = (r: Round) => fighterIn(r, 'foe')!;
const blow: Blow = { raw: 20, what: 'sand', dodgeable: true, physical: false, kind: 'jutsu' };

describe('a spin', () => {
  it('turns every hit aside in a round, paid in chakra each time, unlike a swap', () => {
    const start = round({});
    const once = react(start, { attacker: foe(start), target: neji(start), blow, rng: NO_LUCK });
    const twice = react(once, { attacker: foe(once), target: neji(once), blow, rng: NO_LUCK });
    expect(neji(twice).health).toBe(100);
    expect(neji(once).chakra).toBeLessThan(60);
    expect(neji(twice).chakra).toBeLessThan(neji(once).chakra);
  });

  it('lets the hit through once the chakra is gone', () => {
    const dry = round({ chakra: 0 });
    const hit = react(dry, { attacker: foe(dry), target: neji(dry), blow, rng: NO_LUCK });
    expect(neji(hit).health).toBeLessThan(100);
  });

  it('turns a hold aside too, but never an illusion', () => {
    const r = round({});
    const hold = { attacker: foe(r), target: neji(r), what: 'Sand Coffin' };
    expect(spunAway(r, { ...hold, discipline: 'ninjutsu' })).not.toBeNull();
    expect(spunAway(r, { ...hold, discipline: 'genjutsu' })).toBeNull();
  });

  it('is kept ready ahead of a plain swap', () => {
    const swap: CombatTechnique = {
      ...ROTATION,
      id: 'swap',
      effects: [{ verb: 'substitute', power: 6 }],
    };
    const r = round({ techniques: [swap, ROTATION] });
    expect(defaultReactions(neji(r)).mid).toContain('rotation');
  });
});

/** Eyes that see everything (`all-seeing`): no illusion takes hold of them. */
describe('all-seeing eyes', () => {
  it('see through every illusion, but not a hit', () => {
    const illusion = { ...blow, what: 'illusion', discipline: 'genjutsu' as const };
    const r = round({ techniques: [], perks: ['all-seeing'] });
    const odds = avoidOdds(r, {
      form: 'technique',
      attacker: foe(r),
      target: neji(r),
      skill: 40,
      discipline: illusion.discipline,
    });
    expect(odds).toBe(1);
    const plain = avoidOdds(r, { form: 'technique', attacker: foe(r), target: neji(r), skill: 40 });
    expect(plain).toBeLessThan(1);
  });
});
