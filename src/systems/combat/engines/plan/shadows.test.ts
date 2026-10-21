import { createRng } from '@/core';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { SHADOW_BODIES_MAX } from '../../rules/shadowClones';
import { makeShadows, makesShadows, misled, shadowsAfter, shadowsOf } from './shadows';
import { initialFighters, type Round } from './state';
import { wound } from './wound';

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

const shadowClone: CombatTechnique = {
  id: 'shadow-clone',
  name: 'Shadow Clone',
  discipline: 'ninjutsu',
  chakraCost: 10,
  effects: [{ verb: 'clone', power: 10, strikes: true }],
};
const kick: CombatTechnique = {
  id: 'kick',
  name: 'Kick',
  discipline: 'taijutsu',
  chakraCost: 3,
  effects: [{ verb: 'damage', power: 10 }],
};

function setup(id: string): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 90,
    maxChakra: 90,
    techniques: [shadowClone, kick],
  };
}

function roundOf(): Round {
  const fighters = initialFighters({
    player: setup('hero'),
    allies: [],
    enemies: [setup('foe')],
    canFlee: true,
  });
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

const use = { technique: shadowClone, effect: shadowClone.effects[0]! } as const;

function cast(round: Round): Round {
  return makeShadows(round, round.fighters[0]!, use as never);
}

describe('shadow clones', () => {
  it('split the maker’s chakra evenly, each clone a fighter with the maker’s kit', () => {
    const round = cast(roundOf());
    const clones = shadowsOf(round, 'hero');
    expect(clones).toHaveLength(2);
    const maker = round.fighters[0]!;
    expect(maker.chakra).toBe(30);
    for (const c of clones) {
      expect(c.chakra).toBe(30);
      expect(c.side).toBe('player');
      expect(c.isPlayer).toBe(false);
      expect(c.attributes).toEqual(maker.attributes);
      expect(c.techniques.map((t) => t.id)).toEqual(['kick']);
    }
  });

  it('pop at the first hit that lands, and leave the field as the exchange ends', () => {
    const round = cast(roundOf());
    const [clone] = shadowsOf(round, 'hero');
    const hit = wound(round, clone!.id, 1);
    expect(shadowsOf(hit, 'hero')).toHaveLength(1);
    expect(shadowsAfter(hit).fighters.some((f) => f.id === clone!.id)).toBe(false);
  });

  it('go with their maker when the maker falls', () => {
    const round = cast(roundOf());
    expect(shadowsOf(wound(round, 'hero', 999), 'hero')).toHaveLength(0);
  });

  it('never stand more than a few at once', () => {
    let round = roundOf();
    for (let i = 0; i < 5; i++) round = cast(round);
    expect(shadowsOf(round, 'hero').length).toBeLessThanOrEqual(SHADOW_BODIES_MAX);
  });

  it('look like their maker: an attack aimed at them may go into a clone, less so for sharp eyes', () => {
    const round = cast(roundOf());
    const foe = round.fighters.find((f) => f.id === 'foe')!;
    const hero = round.fighters[0]!;
    const rng = createRng(4);
    const into = (actor: typeof foe) =>
      Array.from({ length: 300 }, () =>
        misled(round, { actor, target: hero, rng }, { kind: 'strike' }),
      ).filter((f) => f?.id !== 'hero').length;
    const sharp = { ...foe, attributes: { ...foe.attributes, perception: 40 } };
    expect(into(foe)).toBeGreaterThan(120);
    expect(into(sharp)).toBeLessThan(into(foe));
  });

  it('come only from a technique that makes them; one that wounds keeps its clones as decoys', () => {
    expect(makesShadows(shadowClone)).toBe(true);
    const bodyBlow: CombatTechnique = {
      ...shadowClone,
      id: 'clone-body-blow',
      effects: [
        { verb: 'damage', power: 12 },
        { verb: 'clone', power: 8, strikes: true },
      ],
    };
    expect(makesShadows(bodyBlow)).toBe(false);
  });
});
