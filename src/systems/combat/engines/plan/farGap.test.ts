import { createRng } from '@/core';

import { holdsOff } from '@/test/fightLines';
import type { CombatantSetup, CombatTechnique, RangeBand } from '../../contract';
import { distanceBetween } from './distance';
import { farGapScale } from './farGap';
import { initialFighters, type Round } from './state';
import { step } from './steps';

/** The far gap (`farGap.ts`). */

const attributes = {
  strength: 10,
  speed: 10,
  stamina: 20,
  chakraControl: 10,
  intellect: 10,
  perception: 10,
  willpower: 10,
  taijutsu: 10,
  ninjutsu: 20,
  genjutsu: 10,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

const gust: CombatTechnique = {
  id: 'gust',
  name: 'Gust',
  discipline: 'ninjutsu',
  effects: [{ verb: 'damage', power: 12 }],
  chakraCost: 4,
  reach: ['mid', 'far'],
};

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

function at(range: RangeBand, holds = false): Round {
  const holdOff = { close: null, mid: 'jutsu:gust', far: 'jutsu:gust' };
  const fighters = initialFighters({
    player: setup('hero'),
    allies: [],
    enemies: [setup('caster', { techniques: [gust] })],
    canFlee: true,
  }).map((f) => (f.id === 'caster' && holds ? { ...f, holdOff } : f));
  return { number: 1, fighters, range, lines: [], seen: {}, intents: {} };
}

function made(range: RangeBand, direction: 'in' | 'back'): number {
  const to: RangeBand = direction === 'in' ? (range === 'far' ? 'mid' : 'close') : 'far';
  let got = 0;
  for (let seed = 1; seed <= 200; seed++) {
    const round = at(range);
    const [hero, caster] = round.fighters;
    const after = step(round, { actor: hero!, target: caster, rng: createRng(seed) }, direction);
    if (distanceBetween(after, 'hero', 'caster') === to) got += 1;
  }
  return got;
}

describe('the far gap', () => {
  it('only the crossing between mid and far is harder', () => {
    expect(farGapScale('far', 'in')).toBeLessThan(1);
    expect(farGapScale('mid', 'back')).toBeLessThan(1);
    expect(farGapScale('mid', 'in')).toBe(1);
    expect(farGapScale('close', 'back')).toBe(1);
  });

  it('closing from far is made less often than closing from mid', () => {
    expect(made('far', 'in')).toBeLessThan(made('mid', 'in'));
  });

  it('a holder at far range gets one shot, as anywhere', () => {
    const lines = Array.from({ length: 100 }, (_, i) => {
      const round = at('far', true);
      const [hero, caster] = round.fighters;
      return step(round, { actor: hero!, target: caster, rng: createRng(i + 1) }, 'in').lines;
    }).flat();
    expect(lines.some((l) => holdsOff('caster', 'hero').test(l))).toBe(true);
    expect(lines.some((l) => l.includes('time for another'))).toBe(false);
  });
});
