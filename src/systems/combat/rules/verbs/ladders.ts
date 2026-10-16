import { canClimb, type LadderId, type LadderStep } from '@/systems/techniques';

import type { CombatTechnique } from '../../contract';

/**
 * Ladders in a fight (the Eight Gates; `systems/techniques/ladders.ts` has the data). Each step
 * open lifts the boosted stats by more than the last: the first gates a little, the deep ones
 * beyond any limit a body has. Opening releases a surge of chakra. An open ladder holds until
 * the fight ends or the body gives out (its health price brings it to `GIVE_OUT_SHARE`), when
 * it slams shut and leaves its user reeling. The deep steps are worth opening only when the
 * fight calls for it: the fifth to seventh against a foe who outclasses you or once badly hurt,
 * the last only in the last ditch.
 */

/** The share each boosted stat rises by with each step open (index 0: nothing open). */
const LADDER_SHARE: Readonly<Record<LadderId, readonly number[]>> = {
  gates: [0, 0.15, 0.25, 0.4, 0.55, 0.7, 0.9, 1.15, 1.6],
};

/** Chakra released by each step newly opened. */
export const CHAKRA_SURGE_PER_STEP = 4;

/** An open ladder gives out once its price has brought health this low (a share of the most). */
export const GIVE_OUT_SHARE = 0.1;

/** Steps anyone opens freely; deeper ones only when the fight calls for it. */
const FREE_STEPS = 3;
/** The last step before the one that kills: opened against a stronger foe, or badly hurt. */
const DEEP_STEPS = 7;

export function stepShare({ ladder, step }: LadderStep): number {
  return LADDER_SHARE[ladder][step] ?? 0;
}

interface Climber {
  readonly empowered?: { readonly opened?: LadderStep };
}

/** The step open on a ladder: 0 when none. */
export function openStep(f: Climber, ladder: LadderId): number {
  const opened = f.empowered?.opened;
  return opened?.ladder === ladder ? opened.step : 0;
}

/** The step a technique opens, if it is a ladder's opening. */
export function opensOf(t: Pick<CombatTechnique, 'effects'>): LadderStep | undefined {
  for (const e of t.effects) if (e.verb === 'empower' && e.opens) return e.opens;
  return undefined;
}

/** Whether a technique's opening can be made now: from the step open, within reach. */
export function canOpen(f: Climber, t: Pick<CombatTechnique, 'effects'>): boolean {
  const opens = opensOf(t);
  return opens !== undefined && canClimb(openStep(f, opens.ladder), opens.step);
}

/** Whether a technique's ladder step is open, when it needs one. */
export function isOpenFor(f: Climber, t: Pick<CombatTechnique, 'needsOpen'>): boolean {
  const needs = t.needsOpen;
  return needs === undefined || openStep(f, needs.ladder) >= needs.step;
}

/** What makes a deeper step worth its price. */
export interface ClimbReasons {
  /** A foe far stronger than them. */
  readonly outmatched: boolean;
  /** Below half their health. */
  readonly hurt: boolean;
  /** In the last ditch. */
  readonly lastDitch: boolean;
}

/** Whether a step is worth opening now. */
export function worthOpening(step: number, why: ClimbReasons): boolean {
  if (step <= FREE_STEPS) return true;
  if (step <= DEEP_STEPS) return why.outmatched || why.hurt || why.lastDitch;
  return why.lastDitch;
}

/** Whether an open ladder gives out at this much health. */
export function givesOut(health: number, maxHealth: number): boolean {
  return health <= Math.round(maxHealth * GIVE_OUT_SHARE);
}
