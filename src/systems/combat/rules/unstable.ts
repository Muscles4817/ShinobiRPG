import type { CombatTechnique } from '../contract';

/**
 * An unstable technique (learned a rank above its user's grade) fights its user's chakra: it
 * costs more, and sometimes falls apart in their hands, chakra spent and nothing done. Every
 * engine reads the cost through `chakraCost` (`body.ts`); engines that roll misfires use
 * `misfireChance`.
 */

/** An unstable technique costs this many times its usual chakra. */
export const UNSTABLE_CHAKRA = 1.5;
/** The chance an unstable technique misfires each time it is used. */
export const UNSTABLE_MISFIRE = 0.25;

export function unstableCostScale(technique: Pick<CombatTechnique, 'unstable'>): number {
  return technique.unstable === true ? UNSTABLE_CHAKRA : 1;
}

export function misfireChance(technique: Pick<CombatTechnique, 'unstable'>): number {
  return technique.unstable === true ? UNSTABLE_MISFIRE : 0;
}
