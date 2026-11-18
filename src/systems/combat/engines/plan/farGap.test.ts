import { createRng } from '@/core';

import { holdsOff } from '@/test/fightLines';
import type { CombatantSetup, CombatTechnique, RangeBand } from '../../contract';
import { distanceBetween } from './distance';
import { farGapScale, withFarGap } from './farGap';
import { initialFighters, type Round } from './state';
import { step } from './steps';

/** The far gap, a rule on trial (`farGap.ts`). */

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

function at(range: RangeBand, farGap: boolean, holds = false): Round {
  const holdOff = { close: null, mid: 'jutsu:gust', far: 'jutsu:gust' };
  const fighters = initialFighters({
    player: setup('hero'),
    allies: [],
    enemies: [setup('caster', { techniques: [gust] })],
    canFlee: true,
  }).map((f) => (f.id === 'caster' && holds ? { ...f, holdOff } : f));
  const tried = withFarGap(fighters, { experiments: { farGap } });
  return { number: 1, fighters: tried, range, lines: [], seen: {}, intents: {} };
}

function made(range: RangeBand, farGap: boolean, direction: 'in' | 'back'): number {
  const to: RangeBand = direction === 'in' ? (range === 'far' ? 'mid' : 'close') : 'far';
  let got = 0;
  for (let seed = 1; seed <= 200; seed++) {
    const round = at(range, farGap);
    const [hero, caster] = round.fighters;
    const after = step(round, { actor: hero!, target: caster, rng: createRng(seed) }, direction);
    if (distanceBetween(after, 'hero', 'caster') === to) got += 1;
  }
  return got;
}

describe('the far gap', () => {
  it('only the crossing between mid and far is harder, and only with the rule on trial', () => {
    const on = { longGap: true as const };
    expect(farGapScale(on, 'far', 'in')).toBeLessThan(1);
    expect(farGapScale(on, 'mid', 'back')).toBeLessThan(1);
    expect(farGapScale(on, 'mid', 'in')).toBe(1);
    expect(farGapScale(on, 'close', 'back')).toBe(1);
    expect(farGapScale({}, 'far', 'in')).toBe(1);
  });

  it('closing from far and getting back out to far are made less often', () => {
    expect(made('far', true, 'in')).toBeLessThan(made('far', false, 'in'));
    expect(made('mid', true, 'back')).toBeLessThan(made('mid', false, 'back'));
    expect(made('mid', true, 'in')).toBe(made('mid', false, 'in'));
  });

  it('a holder at far range has time for a second shot', () => {
    const stopped = (farGap: boolean) =>
      Array.from({ length: 100 }, (_, i) => {
        const round = at('far', farGap, true);
        const [hero, caster] = round.fighters;
        return step(round, { actor: hero!, target: caster, rng: createRng(i + 1) }, 'in');
      }).filter((r) => r.lines.some((l) => holdsOff('caster', 'hero').test(l))).length;
    expect(stopped(true)).toBeGreaterThan(stopped(false));
    const again = Array.from({ length: 100 }, (_, i) => {
      const round = at('far', true, true);
      const [hero, caster] = round.fighters;
      return step(round, { actor: hero!, target: caster, rng: createRng(i + 1) }, 'in');
    }).filter((r) => r.lines.some((l) => l.includes('time for another')));
    expect(again.length).toBeGreaterThan(0);
  });
});
