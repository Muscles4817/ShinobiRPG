import { STAT_IDS, type StatDelta, type StatId } from '@/systems/stats';

/**
 * Early training: how far a student had come before graduation, bought on the academy file
 * with development points. Each step raises a stat by `DEVELOPMENT_STEP`; the first steps are
 * cheap, later ones dearer, so a solid D is affordable and a C at graduation is a prodigy's.
 * Most students may take a stat three steps (a solid D); the best of the year may take a few
 * stats a fourth (a C).
 */

export const DEVELOPMENT_STEP = 2;
/** What each step costs, in order. */
const STEP_COSTS = [1, 1, 2, 2] as const;
/** Steps anyone may take in a stat. */
export const USUAL_MAX_STEPS = 3;
/** Steps a stat may take when the standing allows it a fourth. */
export const HIGH_STEPS = STEP_COSTS.length;

/** Steps bought per stat (missing = none). */
export type Development = Readonly<Partial<Record<StatId, number>>>;

/** What a standing (and an upbringing) let you spend. */
export interface DevelopmentAllowance {
  readonly points: number;
  /** How many stats may take the fourth step. */
  readonly highStats: number;
}

/** What `steps` steps in one stat cost altogether. */
export function stepsCost(steps: number): number {
  return STEP_COSTS.slice(0, steps).reduce((sum, c) => sum + c, 0);
}

/** What the next step in a stat would cost, or null when no step is left. */
export function nextStepCost(steps: number): number | null {
  return STEP_COSTS[steps] ?? null;
}

export function stepsIn(development: Development, stat: StatId): number {
  return development[stat] ?? 0;
}

export function developmentCost(development: Development): number {
  return STAT_IDS.reduce((sum, id) => sum + stepsCost(stepsIn(development, id)), 0);
}

/** Points spent on these stats. */
export function pointsIn(development: Development, stats: readonly StatId[]): number {
  return stats.reduce((sum, id) => sum + stepsCost(stepsIn(development, id)), 0);
}

/** Stats taken to the fourth step. */
export function highStatsTaken(development: Development): number {
  return STAT_IDS.filter((id) => stepsIn(development, id) > USUAL_MAX_STEPS).length;
}

/** The most steps this stat may take now, given the other stats already taken high. */
export function maxStepsFor(
  development: Development,
  stat: StatId,
  allowance: DevelopmentAllowance,
): number {
  const alreadyHigh = stepsIn(development, stat) > USUAL_MAX_STEPS;
  const room = alreadyHigh || highStatsTaken(development) < allowance.highStats;
  return room ? HIGH_STEPS : USUAL_MAX_STEPS;
}

/** The stat points early training adds. */
export function developmentBonuses(development: Development): StatDelta {
  return Object.fromEntries(
    STAT_IDS.map((id) => [id, stepsIn(development, id) * DEVELOPMENT_STEP]),
  );
}

/** Why a development is not allowed, or nothing. */
export function developmentProblems(
  development: Development,
  allowance: DevelopmentAllowance,
): string[] {
  const spent = developmentCost(development);
  const high = highStatsTaken(development);
  const tooFar = STAT_IDS.some((id) => stepsIn(development, id) > HIGH_STEPS);
  return [
    spent > allowance.points &&
      `That training costs ${spent} points; you have ${allowance.points}.`,
    (high > allowance.highStats || tooFar) &&
      (allowance.highStats === 0
        ? 'Nobody in your standing graduates with a stat that far along.'
        : `Only ${allowance.highStats} of your stats can be that far along.`),
  ].filter((p): p is string => typeof p === 'string');
}
