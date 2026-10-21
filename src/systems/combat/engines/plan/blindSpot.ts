import type { Rng } from '@/core';

import { blindSpotChance } from '../../rules/eyes';
import { tell } from '../../rules/telling';
import { say, type PlanFighter, type Round } from './state';

/**
 * The one blind spot of eyes that see everything else (`rules/eyes.ts`): a sharp foe finds it
 * after a few rounds, and an attack that comes through it meets no ready
 * defence, a spin (Palm Rotation) included.
 */

const FOUND = '{a} comes in through the one place {t.poss} eyes cannot see.';

/** Whether this attack comes through the target's blind spot. */
export function throughBlindSpot(
  round: Round,
  { attacker, target, rng }: { attacker: PlanFighter; target: PlanFighter; rng: Rng },
): boolean {
  const chance = blindSpotChance(target, attacker, round.number);
  return chance > 0 && rng.chance(chance);
}

/** The round with the blind spot found, told. */
export function foundBlindSpot(round: Round, attacker: PlanFighter, target: PlanFighter): Round {
  return say(round, tell(FOUND, { a: attacker, t: target }));
}
