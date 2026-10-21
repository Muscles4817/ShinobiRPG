import { createRng, type Rng } from '@/core';

import type { CombatantSetup } from '../../contract';
import type { CombatDust } from '../../dustContract';
import { react, type Blow } from './react';
import { shieldStops, shieldUp } from './shield';
import { fighterIn, initialFighters, type Round } from './state';

/** The automatic shield in a planned fight: it rises on its own, pays in dust, and is outrun. */

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

const SAND: CombatDust = {
  kind: {
    name: 'Sand',
    qualities: { weight: 2, hold: 4, draw: 5 },
    gifts: {},
    banes: ['water'],
    drawnOn: ['arena'],
  },
  count: 200,
  cap: 200,
};

/** Every roll comes up: the shield rises, nothing is slipped. */
const RISES: Rng = { ...createRng(1), chance: (p) => p > 0, next: () => 0.5 };

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

function round(host: Partial<CombatantSetup>, speed = 10): Round {
  const fighters = initialFighters({
    player: setup('host', host),
    allies: [],
    enemies: [setup('foe', { attributes: { ...attributes, speed } })],
    canFlee: true,
  });
  return { number: 1, fighters, range: 'mid', lines: [], seen: {}, intents: {} };
}

const SHIELDED = { dust: SAND, perks: ['shield'] as const };
const host = (r: Round) => fighterIn(r, 'host')!;
const foe = (r: Round) => fighterIn(r, 'foe')!;

function incoming(r: Round, over: { hit?: 'mind' | 'blunt'; breaks?: boolean } = {}) {
  return {
    attacker: foe(r),
    target: host(r),
    what: 'strike',
    hit: over.hit ?? 'blunt',
    breaks: over.breaks ?? false,
    rng: RISES,
  };
}

describe('the shield in a planned fight', () => {
  it('rises on its own, takes a small hit whole and spends dust for it', () => {
    const r = round(SHIELDED);
    const met = shieldUp(r, incoming(r), 10);
    expect(met.force).toBe(0);
    expect(host(met.round).dust!.count).toBe(190);
    expect(met.round.lines.join(' ')).toMatch(/sand rises/);
  });

  it('lets a big hit through with what is left over', () => {
    const r = round(SHIELDED);
    const met = shieldUp(r, incoming(r), 60);
    expect(met.force).toBeGreaterThan(0);
    expect(met.force).toBeLessThan(60);
  });

  it('needs the perk, and never meets an illusion', () => {
    const plain = round({ dust: SAND });
    expect(shieldUp(plain, incoming(plain), 10).force).toBe(10);
    const r = round(SHIELDED);
    expect(shieldUp(r, incoming(r, { hit: 'mind' }), 10).force).toBe(10);
  });

  it('is outrun by an attacker far faster than it rises', () => {
    const r = round(SHIELDED, 60);
    expect(shieldUp(r, incoming(r), 10).force).toBe(10);
  });

  it('keeps a landed blow off its host in the whole reaction', () => {
    const blow: Blow = { raw: 8, what: 'strike', dodgeable: false, physical: true, kind: 'blow' };
    const r = round(SHIELDED);
    const after = react(r, { attacker: foe(r), target: host(r), blow, rng: RISES });
    expect(host(after).health).toBe(100);
    const bare = round({});
    const hurt = react(bare, { attacker: foe(bare), target: host(bare), blow, rng: RISES });
    expect(host(hurt).health).toBeLessThan(100);
  });

  it('stops a hold, a seal or a drain whole when it rises, but never an illusion', () => {
    const r = round(SHIELDED);
    const touch = { attacker: foe(r), target: host(r), what: 'Gentle Fist', rng: RISES };
    const stopped = shieldStops(r, { ...touch, illusion: false });
    expect(stopped).not.toBeNull();
    expect(host(stopped!).dust!.count).toBeLessThan(SAND.count);
    expect(shieldStops(r, { ...touch, illusion: true })).toBeNull();
    const plain = round({ dust: SAND });
    const bare = { ...touch, target: host(plain), illusion: false };
    expect(shieldStops(plain, bare)).toBeNull();
  });
});
