import { createRng } from '@/core';

import type { CombatantSetup } from '../../contract';
import { carriesThrough, type Clones } from '../../rules/verbs';
import { throughClones, type Incoming } from './decoys';
import { initialFighters, type PlanFighter, type Round } from './state';

/** Clones taking hits: a light hit is spent on one, a heavy one tears through it. */

const attributes = {
  strength: 20,
  speed: 20,
  stamina: 20,
  chakraControl: 20,
  intellect: 20,
  perception: 5,
  willpower: 20,
  taijutsu: 20,
  ninjutsu: 40,
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

const clones: Clones = { techniqueId: 'clone', count: 5, skill: 40, strikes: true };

function round(): Round {
  const fighters = initialFighters({
    player: setup('maker'),
    allies: [],
    enemies: [setup('striker')],
    canFlee: true,
  }).map((f): PlanFighter => (f.id === 'maker' ? { ...f, clones } : f));
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

function strike(raw: number, breaks: boolean) {
  return Array.from({ length: 40 }, (_, i) => {
    const r = round();
    const [maker, striker] = r.fighters;
    const hit: Incoming = {
      attacker: striker!,
      target: maker!,
      what: 'Tiger',
      area: false,
      raw,
      breaks,
      rng: createRng(i + 1),
    };
    return throughClones(r, hit);
  }).find((d) => d.round.lines.length > 0)!;
}

describe('a hit meeting clones', () => {
  it('a light hit is spent on the clone it strikes', () => {
    const met = strike(10, false);
    expect(met.absorbed).toBe(true);
    expect(met.round.lines.at(-1)).toMatch(/strikes a clone of maker, which bursts/);
  });

  it('a heavy one bursts the clone on its way through and still reaches the maker', () => {
    const met = strike(60, true);
    expect(met.absorbed).toBe(false);
    expect(met.round.lines.at(-1)).toMatch(/tears straight through a clone of maker/);
    expect(met.round.fighters.find((f) => f.id === 'maker')!.clones?.count).toBe(4);
  });

  it('a break carries through sooner than anything else', () => {
    expect(carriesThrough(35, 100, true)).toBe(true);
    expect(carriesThrough(35, 100, false)).toBe(false);
    expect(carriesThrough(50, 100, false)).toBe(true);
  });
});
