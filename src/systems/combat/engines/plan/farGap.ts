import type { CombatSetup, RangeBand } from '../../contract';
import type { PlanFighter } from './state';

/**
 * The far gap, a rule on trial (`CombatExperiments.farGap`; the owner's note in
 * `docs/design/combat-ai-plan.md` Part 13b): distance isn't even. Close to mid is a short gap,
 * mid to far a long one, so crossing between mid and far is a harder step both ways, and a
 * holder at far range gets a second shot at someone who slipped the first on the way in. A
 * fighter who fights from far, once there, is hard to reach and hard to leave; only a way in made
 * for it (a body flicker, an entry, a teleport) gets past that.
 */

/** The share of the step's contest kept when it crosses the far gap. */
export const FAR_GAP_STEP = 0.7;

/** Who fights under the far gap, in a fight that tries it. */
export function withFarGap(
  fighters: readonly PlanFighter[],
  setup: Pick<CombatSetup, 'experiments'>,
): PlanFighter[] {
  if (!setup.experiments?.farGap) return [...fighters];
  return fighters.map((f) => ({ ...f, longGap: true as const }));
}

/** Whether a step from `at`, in or back, crosses between mid and far. */
export function crossesFarGap(at: RangeBand, direction: 'in' | 'back'): boolean {
  return direction === 'in' ? at === 'far' : at === 'mid';
}

/** The share of a step's contest kept: less across the far gap, with the rule on trial. */
export function farGapScale(
  actor: Pick<PlanFighter, 'longGap'>,
  at: RangeBand,
  direction: 'in' | 'back',
): number {
  return actor.longGap && crossesFarGap(at, direction) ? FAR_GAP_STEP : 1;
}

/** Whether a holder at this distance gets a second shot at a closer who slipped the first. */
export function secondShot(closer: Pick<PlanFighter, 'longGap'>, between: RangeBand): boolean {
  return closer.longGap === true && between === 'far';
}
