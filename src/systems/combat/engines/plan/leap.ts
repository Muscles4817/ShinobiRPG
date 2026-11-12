import { tell } from '../../rules/telling';
import { distanceBetween } from './distance';
import { pairsMoved } from './groundPlay';
import type { PlanFighter, Round } from './state';

/**
 * A Dodge leaps clear (design experiment, `docs/design/combat-ai-plan.md` Part 7): a fighter
 * who slips an attack up close with a Dodge ready doesn't stay where it was aimed. They land
 * clear of whoever threw it, at mid. Only that pair moves (`pairsMoved`), only from close, and
 * only for a ready Dodge (a plain slip, an Evade or a swap stays put).
 *
 * It cuts both ways. A dodger who fights from range gets clear for free. A close fighter must
 * spend a turn coming back in, and may meet a hold-off on the way. An attacker who wants the
 * fight at mid can throw a blow up close to make a dodger give it to them.
 */

const LEAPS_CLEAR = '{a} springs clear of {t}.';

/** After a ready Dodge slipped `attacker`'s attack: the dodger lands at mid, if it was close. */
export function leapClear(round: Round, dodger: PlanFighter, attacker: PlanFighter): Round {
  if (distanceBetween(round, dodger.id, attacker.id) !== 'close') return round;
  const line = tell(LEAPS_CLEAR, { a: dodger, t: attacker });
  return pairsMoved(round, [{ a: dodger.id, b: attacker.id, to: 'mid' }], line);
}
