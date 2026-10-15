import { clamp } from '@/core';
import type { AreaSize } from '@/systems/techniques';

import type { CombatAttributes } from '../contract';

/**
 * Holding a foe off: a fighter can keep an attack ready to meet anyone closing in on them. It's
 * a contest of their aim against the closer's speed, never a sure thing: poor throwing barely
 * slows a quick fighter, and someone fast enough slips through a jutsu. An area technique is
 * far harder to get through, and a vast one can't be outrun at all.
 */

/**
 * The chance to hold an equal off with a single, aimed attack: it takes the place of the step's
 * own contest (an equal closes in a little over half the time either way), but a closer held
 * off is also hit.
 */
export const HOLD_OFF_BASE = 0.45;
const HOLD_OFF_PER_POINT = 0.04;
const HOLD_OFF_MIN = 0.1;
const HOLD_OFF_MAX = 0.85;

/** How much an area adds to holding someone off, by the ground it covers. */
export const AREA_HOLD_OFF: Readonly<Record<AreaSize, number>> = {
  small: 0.1,
  wide: 0.25,
  vast: 1,
};

/** Aim with thrown steel: a quick eye and a quick hand. */
export function throwingAim(a: CombatAttributes): number {
  return (a.perception + a.speed) / 2;
}

/**
 * The chance an attack kept ready stops someone closing in: the holder's aim (their throwing,
 * or their skill with the technique) against the closer's speed, plus what an area adds.
 */
export function holdOffChance(aim: number, closerSpeed: number, area?: AreaSize): number {
  const contest = clamp(
    HOLD_OFF_BASE + (aim - closerSpeed) * HOLD_OFF_PER_POINT,
    HOLD_OFF_MIN,
    HOLD_OFF_MAX,
  );
  return Math.min(1, contest + (area ? AREA_HOLD_OFF[area] : 0));
}
