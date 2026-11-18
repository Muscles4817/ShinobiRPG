import { createRng } from '@/core';

import type { CombatantSetup } from '../../contract';
import { maxBreath } from '../../rules/breath';
import { distanceBetween } from './distance';
import { LEAP_BREATH, leapClear } from './leap';
import { weightOf } from './weight';
import { resolveExchange } from './round';
import { initialFighters, plainSlots, type PlanState, type Reactions } from './state';

/** Dodge clear springs back from what it slips; a plain Dodge stays (`leap.ts`, `weight.ts`). */

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

function fight(ready: 'dodge' | 'dodge-clear' | 'guard'): PlanState {
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

const roundOf = (state: PlanState) => ({
  number: 1,
  fighters: [...state.fighters],
  range: 'close' as const,
  lines: [],
  seen: {},
  intents: {},
});

describe('Dodge clear', () => {
  it('springs back from a heavy attack, pays breath, and moves only the pair', () => {
    const state = fight('dodge-clear');
    const [hero, foe] = state.fighters;
    const round = roundOf(state);
    const heavy = { attacker: hero!, weight: 'heavy' as const, rng: createRng(1) };
    const leapt = leapClear(round, foe!, heavy);
    expect(distanceBetween(leapt, 'foe', 'hero')).toBe('mid');
    const after = leapt.fighters.find((f) => f.id === 'foe')!;
    expect(after.breath).toBe((foe!.breath ?? maxBreath(foe!.attributes)) - LEAP_BREATH);
  });

  it('a light attack’s thrower keeps pace more often than a heavy one’s', () => {
    const state = fight('dodge-clear');
    const [hero, foe] = state.fighters;
    const kept = (weight: 'light' | 'heavy') =>
      Array.from({ length: 60 }, (_, i) =>
        leapClear(roundOf(state), foe!, { attacker: hero!, weight, rng: createRng(i + 1) }),
      ).filter((r) => distanceBetween(r, 'foe', 'hero') === 'close').length;
    expect(kept('heavy')).toBe(0);
    expect(kept('light')).toBeGreaterThan(10);
  });

  it('a plain Dodge stays in range; a Guard nobody moves', () => {
    for (const ready of ['dodge', 'guard'] as const) {
      for (let seed = 1; seed <= 60; seed++) {
        const after = resolveExchange(fight(ready), createRng(seed));
        expect(distanceBetween(after, 'hero', 'foe')).toBe('close');
      }
    }
  });

  it('springs back in a real exchange, sometimes', () => {
    let moved = 0;
    for (let seed = 1; seed <= 60; seed++) {
      const after = resolveExchange(fight('dodge-clear'), createRng(seed));
      if (distanceBetween(after, 'hero', 'foe') === 'mid') moved += 1;
    }
    expect(moved).toBeGreaterThan(0);
  });
});

describe('an attack’s weight', () => {
  it('reads a wide area or a big share as heavy and a small one as light', () => {
    expect(weightOf({ form: 'technique', areaSize: 'wide', threat: 0.05 })).toBe('heavy');
    expect(weightOf({ form: 'technique', threat: 0.3 })).toBe('heavy');
    expect(weightOf({ form: 'blow', threat: 0.05 })).toBe('light');
    expect(weightOf({ form: 'technique', threat: 0.15 })).toBe('medium');
  });
});
