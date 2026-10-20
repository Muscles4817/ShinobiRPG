import type { CombatMeter, CombatOutcome } from '../../contract';
import { isBodyMove, maxBreath } from '../../rules/breath';
import { breathOf } from './effort';
import { dustMeter } from './dust';
import type { Dusty } from './dustBody';
import type { Hive } from './hive';
import type { PlanFighter } from './state';

/** The player's pools on the fight screen and in the outcome: breath, their hive and their dust. */

/** The player's hive on the fight screen, beside their chakra: how many insects are left. */
export function hiveMeter(player: Hive): CombatMeter | null {
  const swarm = player.swarm;
  return swarm ? { id: 'hive', label: 'Hive', value: swarm.count, max: swarm.cap } : null;
}

/** The player's breath, beside their chakra, when they know a body move to spend it on. */
export function breathMeter(player: Breathing): CombatMeter | null {
  if (!player.techniques.some(isBodyMove)) return null;
  const max = maxBreath(player.attributes);
  return { id: 'breath', label: 'Breath', value: breathOf(player), max };
}

type Breathing = Pick<PlanFighter, 'techniques' | 'attributes' | 'breath'>;

/** The fight screen's meters: the field's, if one is cast, and whatever pools the player carries. */
export function metersOf(
  field: CombatMeter | null,
  player: Hive & Dusty & Breathing,
): CombatMeter[] {
  const meters = [field, breathMeter(player), hiveMeter(player), dustMeter(player)];
  return meters.flatMap((m) => (m ? [m] : []));
}

/** What is left of each pool as the fight ends, for the outcome. */
export function poolsLeft(player: Hive & Dusty): Pick<CombatOutcome, 'swarm' | 'dust'> {
  return {
    ...(player.swarm ? { swarm: player.swarm.count } : {}),
    ...(player.dust ? { dust: player.dust.count } : {}),
  };
}
