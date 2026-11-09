import type { CloneEffect, EmpowerEffect } from '@/systems/techniques';

import type { CombatTechnique } from '../../contract';
import {
  attributesAfterEmpower,
  cloneCount,
  clonesFrom,
  decoyChance,
  empower,
  empowerCostsOwed,
  empowerEnds,
  empowerExchanges,
  empowerPrice,
  empowerShare,
  healthAfterPrice,
  MAX_CLONES,
  MAX_EMPOWER_EXCHANGES,
  oneBurst,
  spotChance,
  springs,
  trapAt,
} from '.';

const stats = (value: number) => ({
  strength: value,
  speed: value,
  stamina: value,
  chakraControl: value,
  intellect: value,
  perception: value,
  willpower: value,
  taijutsu: value,
  ninjutsu: value,
  genjutsu: value,
  kenjutsu: value,
  fuuinjutsu: value,
});

const surgeEffect: EmpowerEffect = {
  verb: 'empower',
  power: 12,
  boosts: ['strength', 'taijutsu'],
  healthPerExchange: 6,
  afterCost: { kind: 'exhaustion', days: 1 },
};
const surge: CombatTechnique = {
  id: 'surge',
  name: 'Surge',
  discipline: 'taijutsu',
  effects: [surgeEffect],
  chakraCost: 8,
};
const surgeUse = { technique: surge, effect: surgeEffect };

const shadeEffect: CloneEffect = { verb: 'clone', power: 10, strikes: true };
const shades: CombatTechnique = {
  id: 'shades',
  name: 'Shades',
  discipline: 'ninjutsu',
  effects: [shadeEffect],
  chakraCost: 12,
};
const shadeUse = { technique: shades, effect: shadeEffect };

describe('empower', () => {
  const fighter = { attributes: stats(10), maxChakra: 60, health: 100, maxHealth: 100 };

  it('raises only the boosted stats, more in skilled hands', () => {
    const { attributes } = empower(fighter, surgeUse, { drive: 10, exchange: 1 });
    expect(attributes.strength).toBeGreaterThan(10);
    expect(attributes.taijutsu).toBeGreaterThan(10);
    expect(attributes.speed).toBe(10);
    expect(empowerShare(30, surgeUse)).toBeGreaterThan(empowerShare(10, surgeUse));
  });

  it('holds longer on deeper reserves, up to a limit', () => {
    expect(empowerExchanges(120)).toBeGreaterThan(empowerExchanges(50));
    expect(empowerExchanges(10_000)).toBe(MAX_EMPOWER_EXCHANGES);
    const { empowered } = empower(fighter, surgeUse, { drive: 10, exchange: 3 });
    expect(empowered.until).toBe(3 + empowerExchanges(60));
  });

  it('costs health each exchange, eased by willpower but never knocking its user out', () => {
    expect(empowerPrice(40, surgeUse)).toBeLessThan(empowerPrice(10, surgeUse));
    expect(empowerPrice(40, surgeUse)).toBeGreaterThan(0);
    const { empowered } = empower(fighter, surgeUse, { drive: 10, exchange: 1 });
    expect(healthAfterPrice({ ...fighter, empowered })).toBe(100 - empowered.healthPerExchange);
    expect(healthAfterPrice({ ...fighter, health: 2, empowered })).toBe(1);
  });

  it('gives the stats back when it ends', () => {
    const raised = { ...fighter, ...empower(fighter, surgeUse, { drive: 10, exchange: 1 }) };
    expect(empowerEnds(raised, raised.empowered.until! - 1)).toBe(false);
    expect(empowerEnds(raised, raised.empowered.until!)).toBe(true);
    expect(attributesAfterEmpower(raised)).toEqual(stats(10));
  });

  it('owes its after-fight cost once per use', () => {
    const once = empower(fighter, surgeUse, { drive: 10, exchange: 1 });
    const twice = empower({ ...fighter, ...once }, surgeUse, { drive: 10, exchange: 5 });
    const costs = empowerCostsOwed({ ...twice, techniques: [surge] });
    expect(costs).toHaveLength(2);
    expect(costs[0]).toEqual({
      techniqueId: 'surge',
      techniqueName: 'Surge',
      cost: surgeEffect.afterCost,
    });
  });
});

describe('clone', () => {
  it('makes more clones on deeper reserves, at least one and at most a handful', () => {
    expect(cloneCount(120, shadeUse)).toBeGreaterThan(cloneCount(60, shadeUse));
    expect(cloneCount(1, shadeUse)).toBe(1);
    expect(cloneCount(10_000, shadeUse)).toBe(MAX_CLONES);
    expect(clonesFrom(10, 60, shadeUse).strikes).toBe(true);
  });

  it('more clones and a better maker take more hits; sharp eyes and insight fewer', () => {
    const few = clonesFrom(10, 60, shadeUse);
    const many = { ...few, count: 4 };
    expect(decoyChance(many, 10, false)).toBeGreaterThan(decoyChance(few, 10, false));
    expect(decoyChance({ ...few, skill: 25 }, 10, false)).toBeGreaterThan(
      decoyChance(few, 10, false),
    );
    expect(decoyChance(few, 25, false)).toBeLessThan(decoyChance(few, 10, false));
    expect(decoyChance(few, 10, true)).toBeLessThan(decoyChance(few, 10, false));
    expect(decoyChance({ ...few, count: 0 }, 10, false)).toBe(0);
  });

  it('loses one at a time', () => {
    const clones = clonesFrom(10, 60, shadeUse);
    expect(oneBurst(clones).count).toBe(clones.count - 1);
    expect(oneBurst({ ...clones, count: 0 }).count).toBe(0);
  });
});

describe('trap', () => {
  const trap = trapAt('snare', 'mid', { craft: 12, exchange: 2 });

  it('springs where it was set: from the next exchange, or at once on a step into it', () => {
    expect(springs(trap, { band: 'mid', exchange: 2, moved: false })).toBe(false);
    expect(springs(trap, { band: 'mid', exchange: 3, moved: false })).toBe(true);
    expect(springs(trap, { band: 'mid', exchange: 2, moved: true })).toBe(true);
    expect(springs(trap, { band: 'close', exchange: 3, moved: true })).toBe(false);
  });

  it('is noticed more often by sharper eyes, within bounds', () => {
    expect(spotChance(trap, 30)).toBeGreaterThan(spotChance(trap, 12));
    expect(spotChance(trap, 0)).toBeGreaterThan(0);
    expect(spotChance(trap, 100)).toBeLessThan(1);
  });
});
