import { clamp } from '@/core';

import type { CombatAttributes } from '../contract';

/**
 * Team rules every engine shares: a fighter covering a teammate may step in front of a single
 * attack aimed at them; a foe left open by a daze or held by a seal takes a finisher harder
 * (set-up and payoff, whoever set it up); and a combination technique lands harder than either
 * half alone.
 */

/** The chance a cover steps in, before the speed gap. */
const COVER_BASE = 0.4;
const COVER_PER_SPEED = 0.03;
const COVER_MIN = 0.15;
const COVER_MAX = 0.7;

/** How much harder a damage effect lands on a dazed or sealed foe. */
export const FINISHER_BONUS = 1.25;

/** How much harder each half of a combination technique lands. */
export const COMBINATION_BONUS = 1.4;

interface Quick {
  readonly attributes: Pick<CombatAttributes, 'speed'>;
}

/** The chance a covering fighter gets in front of an attack: quicker than the attacker, likelier. */
export function coverChance(cover: Quick, attacker: Quick): number {
  const gap = cover.attributes.speed - attacker.attributes.speed;
  return clamp(COVER_BASE + gap * COVER_PER_SPEED, COVER_MIN, COVER_MAX);
}

/** The finisher bonus against a foe who is open (dazed) or held (sealed), else 1. */
export function finisherScale(target: { readonly open: boolean }): number {
  return target.open ? FINISHER_BONUS : 1;
}
