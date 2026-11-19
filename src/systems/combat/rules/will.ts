import { clamp } from '@/core';

import type { CombatAttributes } from '../contract';

/**
 * Will: what a mind holds out with. An ordeal of the mind (Tsukuyomi's days in a dream) wears it
 * down rather than the body, by the caster's genjutsu and control against the target's
 * willpower, and a mind worn to nothing gives out: its body passes out where it stands. It comes
 * back a little each exchange, so only a mind pressed hard enough breaks.
 */

/** Will everyone has… */
const WILL_BASE = 20;
/** …and this much more for each point of willpower. */
const WILL_PER_POINT = 2;
/** Will gathered back each exchange. */
export const WILL_BACK = 2;
/** How far the art against the will can tilt a drain either way. */
const RATIO_MIN = 0.5;
const RATIO_MAX = 2;

export function maxWill(attributes: Pick<CombatAttributes, 'willpower'>): number {
  return WILL_BASE + attributes.willpower * WILL_PER_POINT;
}

type Mind = Pick<CombatAttributes, 'genjutsu' | 'chakraControl' | 'willpower'>;

/** Will an ordeal of this power takes from the target. */
export function willDrained(user: Mind, target: Mind, power: number): number {
  const art = (user.genjutsu + user.chakraControl) / 2;
  const ratio = clamp((art + 1) / (target.willpower + 1), RATIO_MIN, RATIO_MAX);
  return Math.round(power * ratio);
}
