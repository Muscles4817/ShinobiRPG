import { clamp } from '@/core';

import type { CombatAttributes, CombatTechnique } from '../contract';
import { isHindering, isWounding } from './verbs';

/**
 * Catching someone in a hold (a pin, a seal, a daze that wounds nothing): it lands only on a foe
 * who is there to be caught. A mind quicker than the caster's reads the hand signs, and a body
 * quicker than theirs is elsewhere when the hold closes, so the chance to escape a hold grows
 * with the target's wits and speed over the caster's (`escapeScale`), wits counting most.
 */

/** Each point of elusiveness over the caster's makes escaping a hold this much likelier… */
const ESCAPE_PER_POINT = 0.02;
/** …within these bounds. */
const ESCAPE_MIN = 0.7;
const ESCAPE_MAX = 1.8;
/** However elusive the target, a hold is escaped no more often than this. */
export const HOLD_ESCAPE_CEILING = 0.85;
/** Wits count this much more than speed in slipping a hold. */
const WITS_WEIGHT = 1.5;

interface Rated {
  readonly attributes: CombatAttributes;
}

function elusiveness({ attributes: a }: Rated): number {
  return a.intellect * WITS_WEIGHT + a.speed;
}

/** A technique that only holds a foe, wounding no one. */
export function holdsOnly(t: CombatTechnique): boolean {
  return isHindering(t) && !isWounding(t);
}

/** How much likelier a target escapes a hold, by their elusiveness over the caster's. */
export function escapeScale(caster: Rated, target: Rated): number {
  const gap = elusiveness(target) - elusiveness(caster);
  return clamp(1 + gap * ESCAPE_PER_POINT, ESCAPE_MIN, ESCAPE_MAX);
}
