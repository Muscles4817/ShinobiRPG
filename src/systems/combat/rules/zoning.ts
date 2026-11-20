import { clamp } from '@/core';
import type { AreaSize } from '@/systems/techniques';

/**
 * Holding a foe off: a fighter can keep an attack ready to meet anyone closing in on them. It's
 * a contest of their aim against the closer's speed, never a sure thing: poor throwing barely
 * slows a quick fighter, and someone fast enough slips through a jutsu. An area technique is
 * far harder to get through, and a vast one can't be outrun at all. A single thrown blade across
 * the far gap almost never finds someone coming in, short of a thrower far better than they are
 * quick; a volley of shuriken finds them far more often, but lightly (and whether a hit stops
 * them is the hit's own business: `stopsCloser` in `size.ts`).
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
/** Short of a vast area, nothing holds someone off every time: there's always a gap. */
const HOLD_OFF_CEILING = 0.9;

/** How much an area adds to holding someone off, by the ground it covers. */
export const AREA_HOLD_OFF: Readonly<Record<AreaSize, number>> = {
  small: 0.1,
  wide: 0.25,
  vast: 1,
};

/** A single thrown blade at far range loses this much aim: a long way for one blade to fly. */
export const FAR_BLADE_PENALTY = 15;
/** And at far range it finds someone coming in no more surely than this, short of real skill. */
const FAR_BLADE_MIN = 0.03;
/** A volley of shuriken is this much easier to put in someone's path than one blade. */
export const VOLLEY_AIM = 8;

/** What is thrown to hold someone off: one blade, or a volley. */
export type ThrownShot = 'blade' | 'volley';

/**
 * Why a hold-off stopped someone, for the story: an area too wide to slip (or too vast to
 * outrun), aim that outmatches their speed, or (with neither) a shot simply well timed.
 */
export type HoldOffReason = 'wide' | 'vast' | 'aim' | 'timing';

export function holdOffReason(aim: number, closerSpeed: number, area?: AreaSize): HoldOffReason {
  if (area === 'vast' || area === 'wide') return area;
  return aim > closerSpeed ? 'aim' : 'timing';
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
  const ceiling = area === 'vast' ? 1 : HOLD_OFF_CEILING;
  return Math.min(ceiling, contest + (area ? AREA_HOLD_OFF[area] : 0));
}

/**
 * The chance thrown steel meets someone closing in: a volley more surely, a single blade at far
 * range hardly at all unless the thrower's skill (`throwPower`: the weapon art, aimed by
 * perception) is well beyond the closer's speed.
 */
export function thrownHoldOffChance(
  aim: number,
  closerSpeed: number,
  { shot, far }: { readonly shot: ThrownShot; readonly far: boolean },
): number {
  if (shot === 'volley') return holdOffChance(aim + VOLLEY_AIM, closerSpeed);
  if (!far) return holdOffChance(aim, closerSpeed);
  const contest = HOLD_OFF_BASE + (aim - FAR_BLADE_PENALTY - closerSpeed) * HOLD_OFF_PER_POINT;
  return clamp(contest, FAR_BLADE_MIN, HOLD_OFF_MAX);
}
