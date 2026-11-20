import type { RangeBand } from '../../contract';

/**
 * The far gap (the owner's note in `docs/design/combat-ai-plan.md` Part 13b): distance isn't
 * even. Close to mid is a short gap, mid to far a long one, so crossing between mid and far is a
 * harder step both ways. A fighter who fights from far, once there, is hard to reach and hard to
 * leave; only a way in made for it (a body flicker, an entry, a teleport) gets past that.
 */

/** The share of the step's contest kept when it crosses the far gap. */
export const FAR_GAP_STEP = 0.7;

/** Whether a step from `at`, in or back, crosses between mid and far. */
export function crossesFarGap(at: RangeBand, direction: 'in' | 'back'): boolean {
  return direction === 'in' ? at === 'far' : at === 'mid';
}

/** The share of a step's contest kept: less across the far gap. */
export function farGapScale(at: RangeBand, direction: 'in' | 'back'): number {
  return crossesFarGap(at, direction) ? FAR_GAP_STEP : 1;
}
