import { alive } from '../../rules/body';
import { isGathering } from './gather';
import type { PlanFighter, Round } from './state';

/**
 * Riding a summon (Jiraiya on Gamabunta's head): a caller who gives their turn to stillness
 * (gathering, or meditating into Sage Mode) can't slip anything themselves, but a summon of theirs
 * big enough to carry them (`CombatCall.mount`) leaps clear for them. An attack on the rider is
 * slipped as the mount would slip it, evading with all it has (`avoid.ts`); what isn't slipped
 * still lands on the rider.
 */

/** The mount carrying a still rider clear, if one of theirs stands on the field. */
export function carrierOf(
  round: Pick<Round, 'fighters'>,
  rider: PlanFighter,
): PlanFighter | undefined {
  if (!isGathering(rider)) return undefined;
  return round.fighters.find((f) => f.summoner === rider.id && f.mount === true && alive(f));
}

/** The mount as it meets the attack in its rider's place: committed to getting clear. */
export function leapingClear(mount: PlanFighter): PlanFighter {
  return { ...mount, committed: 'evade', gathering: false };
}
