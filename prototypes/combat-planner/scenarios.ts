import { createRng } from '@/core';
import type { CombatantSetup, CombatTechnique } from '@/systems/combat/contract';
import { createPlanEngine } from '@/systems/combat/engines/plan/engine';
import { decode, type PlanState } from '@/systems/combat/engines/plan/state';

/**
 * Fights for the prototype, built through the real engine's `start` (default plans, ready
 * defences, opening intents), so nothing about them is hand-arranged for the planner. The
 * techniques are plain data: none says what it combines with.
 */

type Attributes = CombatantSetup['attributes'];

const AVERAGE: Attributes = {
  strength: 20,
  speed: 20,
  stamina: 20,
  chakraControl: 20,
  intellect: 20,
  perception: 20,
  willpower: 20,
  taijutsu: 20,
  ninjutsu: 20,
  genjutsu: 20,
  kenjutsu: 10,
  fuuinjutsu: 10,
};

export function fighter(
  id: string,
  techniques: readonly CombatTechnique[],
  overrides: Partial<CombatantSetup> & { readonly stats?: Partial<Attributes> } = {},
): CombatantSetup {
  const { stats, ...rest } = overrides;
  return {
    id,
    name: id,
    attributes: { ...AVERAGE, ...stats },
    health: 100,
    maxHealth: 100,
    chakra: 80,
    maxChakra: 80,
    techniques,
    ...rest,
  };
}

/** A one-on-one fight, the planner as the player, at a distance. */
export function duel(
  me: CombatantSetup,
  foe: CombatantSetup,
  range: 'close' | 'mid' | 'far' = 'close',
): PlanState {
  const state = decode(
    createPlanEngine().start(
      {
        player: me,
        allies: [],
        enemies: [foe],
        canFlee: false,
        opening: { range },
      },
      createRng(1),
    ),
  );
  return { ...state, phase: 'fight' };
}

// Techniques: plain data, as a pack would write them. None is a body move (taijutsu with no
// element), so the style strike (`repertoire.ts`), which picks and chains body moves by feel,
// never plays them for the planner.

/** A small, cheap shot at close or mid. */
export const spark: CombatTechnique = {
  id: 'spark',
  name: 'Spark',
  discipline: 'ninjutsu',
  reach: ['close', 'mid'],
  effects: [{ verb: 'damage', power: 16 }],
  chakraCost: 4,
};

/** A flash that dazes, and hurts nobody. */
export const flash: CombatTechnique = {
  id: 'flash',
  name: 'Lantern Flash',
  discipline: 'genjutsu',
  reach: ['close', 'mid'],
  effects: [{ verb: 'daze', power: 16 }],
  chakraCost: 6,
};

/** A heavy blow that only lands on someone who can't move (a finisher). */
export const burst: CombatTechnique = {
  id: 'burst',
  name: 'Lantern Burst',
  discipline: 'ninjutsu',
  reach: ['close', 'mid'],
  needsTarget: 'open',
  effects: [{ verb: 'damage', power: 36 }],
  chakraCost: 12,
};

/** Gone from sight. */
export const veil: CombatTechnique = {
  id: 'veil',
  name: 'Lantern Veil',
  discipline: 'genjutsu',
  reach: ['close', 'mid', 'far'],
  effects: [{ verb: 'conceal', power: 16 }],
  chakraCost: 8,
};

/** A killing blow on someone who can't see it coming (`rules/lethal.ts`). */
export const blade: CombatTechnique = {
  id: 'blade',
  name: 'Wick Blade',
  discipline: 'ninjutsu',
  reach: ['close'],
  lethal: true,
  effects: [{ verb: 'damage', power: 26 }],
  chakraCost: 14,
};

/** A strong shot from range. */
export const sling: CombatTechnique = {
  id: 'sling',
  name: 'Stone Sling',
  discipline: 'ninjutsu',
  reach: ['mid', 'far'],
  effects: [{ verb: 'damage', power: 30 }],
  chakraCost: 14,
};
