import { createRng } from '@/core';

import type { CombatantSetup } from '../../contract';
import { carriesThrough, CLONE_CARRY_SCALE, type Clones } from '../../rules/verbs';
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

function ofKind(r: Round, kind: NonNullable<Clones['kind']>): Round {
  const fighters = r.fighters.map((f) =>
    f.id === 'maker' ? { ...f, clones: { ...clones, kind } } : f,
  );
  return { ...r, fighters };
}

function strike(raw: number, breaks: boolean, kind?: Clones['kind'], physical = false) {
  return Array.from({ length: 40 }, (_, i) => {
    const r = kind ? ofKind(round(), kind) : round();
    const [maker, striker] = r.fighters;
    const hit: Incoming = {
      attacker: striker!,
      target: maker!,
      what: 'Tiger',
      area: false,
      raw,
      breaks,
      physical,
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
    const met = strike(70, true);
    expect(met.absorbed).toBe(false);
    expect(met.carried).toBe(CLONE_CARRY_SCALE);
    expect(met.round.lines.at(-1)).toMatch(/tears straight through a clone of maker/);
    expect(met.round.fighters.find((f) => f.id === 'maker')!.clones?.count).toBe(4);
  });

  it('a break carries through sooner than anything else', () => {
    expect(carriesThrough(55, 100, true)).toBe(true);
    expect(carriesThrough(55, 100, false)).toBe(false);
    expect(carriesThrough(85, 100, false)).toBe(true);
  });

  it('an earth clone may take a light hit and stand', () => {
    const lines = Array.from({ length: 40 }, (_, i) => {
      const r = ofKind(round(), 'earth');
      const [maker, striker] = r.fighters;
      const hit: Incoming = {
        attacker: striker!,
        target: maker!,
        what: 'Tiger',
        area: false,
        raw: 10,
        breaks: false,
        rng: createRng(i + 1),
      };
      return throughClones(r, hit).round.lines.join(' ');
    });
    expect(lines.some((l) => l.includes('takes it and stands'))).toBe(true);
    expect(lines.some((l) => l.includes('which bursts'))).toBe(true);
  });

  it('a lightning clone burst by a blow up close shocks the striker', () => {
    const met = strike(10, false, 'lightning', true);
    const striker = met.round.fighters.find((f) => f.id === 'striker')!;
    expect(met.round.lines.join(' ')).toMatch(/lightning leaps into striker/);
    expect(striker.health).toBeLessThan(100);
    const thrown = strike(10, false, 'lightning', false);
    expect(thrown.round.lines.join(' ')).not.toMatch(/lightning leaps/);
  });
});
