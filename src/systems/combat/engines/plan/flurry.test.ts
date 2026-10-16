import { createRng } from '@/core';
import type { Accuracy } from '@/systems/techniques';

import { GUARDED, SLIPS, hitsOn } from '@/test/fightLines';

import type { CombatantSetup, CombatTechnique } from '../../contract';
import { useJutsu } from './jutsu';
import { fighterIn, initialFighters, plainSlots, type PlanFighter, type Round } from './state';

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

function kick(hits?: number, accuracy?: Accuracy): CombatTechnique {
  return {
    id: 'kick',
    name: 'Kick',
    discipline: 'taijutsu',
    effects: [{ verb: 'damage', power: 12, ...(hits ? { hits } : {}) }],
    chakraCost: 4,
    ...(accuracy ? { accuracy } : {}),
  };
}

function setup(id: string): CombatantSetup {
  return {
    id,
    name: id,
    attributes,
    health: 100,
    maxHealth: 100,
    chakra: 50,
    maxChakra: 50,
    techniques: [],
  };
}

function roundWith(slots: readonly string[] = []): Round {
  const fighters = initialFighters({
    player: setup('hero'),
    allies: [],
    enemies: [setup('bandit')],
    canFlee: true,
  }).map((f): PlanFighter =>
    f.id === 'bandit' ? { ...f, loadout: { close: plainSlots(slots), mid: [], far: [] } } : f,
  );
  return { number: 1, fighters, range: 'close', lines: [], seen: {}, intents: {} };
}

function use(round: Round, t: CombatTechnique, seed: number): Round {
  const [actor, target] = round.fighters;
  return useJutsu(round, { actor: actor!, target, rng: createRng(seed) }, t);
}

describe('flurries, reach and accuracy in plan & watch', () => {
  it('a flurry lands as several blows, about as hard in all as one', () => {
    let single = 0;
    let flurry = 0;
    const landed = new Set<number>();
    for (let seed = 1; seed <= 40; seed++) {
      const one = use(roundWith(), kick(), seed);
      const three = use(roundWith(), kick(3), seed);
      // A foe may slip the whole technique; once it reaches them, each later blow may be
      // slipped on its own.
      landed.add(three.lines.filter((l) => hitsOn('bandit', 'Kick').test(l)).length);
      single += 100 - fighterIn(one, 'bandit')!.health;
      flurry += 100 - fighterIn(three, 'bandit')!.health;
    }
    expect([...landed].every((n) => n <= 3)).toBe(true);
    expect(landed).toContain(3);
    expect(landed.has(1) || landed.has(2)).toBe(true);
    expect(flurry / single).toBeGreaterThan(0.8);
    expect(flurry / single).toBeLessThan(1.15);
  });

  it('a guard meets only the first blow of a flurry', () => {
    const after = use(roundWith(['guard']), kick(3), 1);
    const guarded = after.lines.filter((l) => GUARDED.test(l));
    expect(guarded).toHaveLength(1);
  });

  it('beats a guard: a flurry takes more off a guarding foe than one blow', () => {
    let single = 0;
    let flurry = 0;
    for (let seed = 1; seed <= 40; seed++) {
      single += 100 - fighterIn(use(roundWith(['guard']), kick(), seed), 'bandit')!.health;
      flurry += 100 - fighterIn(use(roundWith(['guard']), kick(3), seed), 'bandit')!.health;
    }
    expect(flurry).toBeGreaterThan(single);
  });

  it('a sure technique is slipped less often than a steady one, a wild one more', () => {
    const slips = (accuracy?: Accuracy) => {
      let n = 0;
      for (let seed = 1; seed <= 300; seed++) {
        const after = use(roundWith(['dodge']), kick(undefined, accuracy), seed);
        if (after.lines.some((l) => SLIPS.test(l))) n++;
      }
      return n;
    };
    const sure = slips('sure');
    const steady = slips();
    const wild = slips('wild');
    expect(sure).toBeLessThan(steady);
    expect(steady).toBeLessThan(wild);
  });
});
