import { createRng } from '@/core';

import type { CombatantSetup } from '../../contract';
import { distanceBetween } from './distance';
import { leapClear } from './leap';
import { resolveExchange } from './round';
import { initialFighters, plainSlots, type PlanState, type Reactions } from './state';

/** A ready Dodge leaps clear of what it slips up close (`leap.ts`). */

const attributes = {
  strength: 20,
  speed: 20,
  stamina: 20,
  chakraControl: 20,
  intellect: 20,
  perception: 40,
  willpower: 20,
  taijutsu: 20,
  ninjutsu: 20,
  genjutsu: 20,
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
    chakra: 80,
    maxChakra: 80,
    techniques: [],
  };
}

function fight(ready: 'dodge' | 'guard'): PlanState {
  const reactions: Reactions = { close: ready, mid: ready, far: ready };
  const fighters = initialFighters({
    player: setup('hero'),
    allies: [],
    enemies: [setup('foe')],
    canFlee: false,
  }).map((f) =>
    f.isPlayer
      ? { ...f, loadout: { close: plainSlots(['strike']), mid: [], far: [] } }
      : { ...f, reactions },
  );
  return {
    phase: 'fight',
    round: 1,
    bout: 1,
    exchange: 0,
    fighters,
    range: 'close',
    seen: {},
    intents: {},
    log: [],
    result: null,
    canFlee: false,
  };
}

describe('a Dodge leaps clear', () => {
  it('moves only the pair, only from close', () => {
    const state = fight('dodge');
    const [hero, foe] = state.fighters;
    const round = {
      number: 1,
      fighters: [...state.fighters],
      range: 'close' as const,
      lines: [],
      seen: {},
      intents: {},
    };
    const leapt = leapClear(round, foe!, hero!);
    expect(distanceBetween(leapt, 'foe', 'hero')).toBe('mid');
    expect(leapClear(leapt, foe!, hero!)).toBe(leapt);
  });

  it('a slip with Dodge ready leaves the pair at mid; with Guard ready nobody moves', () => {
    const counts = { dodge: 0, guard: 0 };
    for (const ready of ['dodge', 'guard'] as const) {
      for (let seed = 1; seed <= 60; seed++) {
        const after = resolveExchange(fight(ready), createRng(seed));
        if (distanceBetween(after, 'hero', 'foe') === 'mid') counts[ready]++;
      }
    }
    expect(counts.dodge).toBeGreaterThan(0);
    expect(counts.guard).toBe(0);
  });
});
