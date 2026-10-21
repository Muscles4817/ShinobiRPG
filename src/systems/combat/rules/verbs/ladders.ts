import { canClimb, type LadderId, type LadderStep } from '@/systems/techniques';

import type { CombatTechnique } from '../../contract';

/**
 * Ladders in a fight (the Eight Gates; `systems/techniques/ladders.ts` has the data). Each step
 * open lifts the boosted stats by more than the last: the first gates a little, the deep ones
 * beyond any limit a body has. Opening releases a surge of chakra. An open ladder holds until
 * the fight ends or the body gives out (its toll, `tolls.ts`, brings health to `GIVE_OUT_SHARE`
 * or breath to nothing), when it slams shut and leaves its user reeling and spent. A step is
 * worth opening only when the fight calls for it (`worthOpening`), a band at a time.
 */

/** The share each boosted stat rises by with each step open (index 0: nothing open). */
const LADDER_SHARE: Readonly<Record<LadderId, readonly number[]>> = {
  gates: [0, 0.15, 0.25, 0.4, 0.55, 0.7, 0.9, 1.15, 1.6],
};

/** Chakra released by each step newly opened. */
export const CHAKRA_SURGE_PER_STEP = 4;

/** An open ladder gives out once its price has brought health this low (a share of the most). */
export const GIVE_OUT_SHARE = 0.1;

/**
 * The bands a ladder is climbed through, a band at a time (`stepBand`): the first three gates,
 * the fourth to sixth, the seventh, the last. A plan climbs into the next band only when the one
 * below has been tried (`defaults.ts`), never straight to the deep gates for one move.
 */
const BAND_TOPS: readonly number[] = [3, 6, 7, 8];

export function stepShare({ ladder, step }: LadderStep): number {
  return LADDER_SHARE[ladder][step] ?? 0;
}

interface Climber {
  readonly empowered?: { readonly opened?: LadderStep };
  readonly laddersShut?: readonly LadderId[];
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

/**
 * Whether a technique's opening can be made now: from the step open, within reach, on a ladder
 * that hasn't given out this fight.
 */
export function canOpen(f: Climber, t: Pick<CombatTechnique, 'effects'>): boolean {
  const opens = opensOf(t);
  if (opens === undefined || (f.laddersShut ?? []).includes(opens.ladder)) return false;
  return canClimb(openStep(f, opens.ladder), opens.step);
}

/** Whether a technique's ladder step is open, when it needs one. */
export function isOpenFor(f: Climber, t: Pick<CombatTechnique, 'needsOpen'>): boolean {
  const needs = t.needsOpen;
  return needs === undefined || openStep(f, needs.ladder) >= needs.step;
}

/** The band a step is in: 1 the first three gates, up to 4 the last (0: nothing open). */
export function stepBand(step: number): number {
  if (step <= 0) return 0;
  const band = BAND_TOPS.findIndex((top) => step <= top);
  return band < 0 ? BAND_TOPS.length : band + 1;
}

/**
 * What makes a step worth its price: what the fighter has seen of the fight so far
 * (`plan/climbing.ts`). A fighter fights with their art first and climbs only when it isn't
 * enough.
 */
export interface ClimbReasons {
  /** The fight is going against them: the foe has lost less than they have (or, sized up at sight, is far stronger). */
  readonly losing: boolean;
  /** Their blows have barely touched the foe. */
  readonly cantHurt: boolean;
  /** Below half their health. */
  readonly hurt: boolean;
  /** In the last ditch. */
  readonly lastDitch: boolean;
  /** The step open now (if any) has had its chance: fought with for `STEP_TRIAL` exchanges. */
  readonly settled: boolean;
}

/** Exchanges a step is fought with before a deeper band is worth opening. */
export const STEP_TRIAL = 2;

/**
 * Whether a step is worth opening now: the first gates when the fight goes against them; the
 * middle ones when they can't hurt the foe, or are losing and hurt; the seventh, which ends their
 * fight within a round, only against a foe they can't hurt or losing in the last ditch; the last
 * only in the last ditch. Past the first band, the gate open now must have had its chance first
 * (`settled`), unless it is the last ditch: no climbing straight through to the top.
 */
export function worthOpening(step: number, why: ClimbReasons): boolean {
  const band = stepBand(step);
  if (band > 1 && !why.settled && !why.lastDitch) return false;
  switch (band) {
    case 0:
    case 1:
      return why.losing || why.cantHurt || why.hurt;
    case 2:
      return why.cantHurt || (why.losing && why.hurt) || why.lastDitch;
    case 3:
      return why.cantHurt || (why.losing && why.lastDitch);
    default:
      return why.lastDitch;
  }
}

/** Whether an open ladder gives out: health worn down by its price, or no breath left. */
export function givesOut(body: {
  readonly health: number;
  readonly maxHealth: number;
  readonly breath: number;
}): boolean {
  return body.health <= Math.round(body.maxHealth * GIVE_OUT_SHARE) || body.breath <= 0;
}
