import type { CombatMeter, CombatOutcome } from '../../contract';
import { dustMeter } from './dust';
import type { Dusty } from './dustBody';
import type { Hive } from './hive';

/** The player's pools on the fight screen and in the outcome: their hive and their dust. */

/** The player's hive on the fight screen, beside their chakra: how many insects are left. */
export function hiveMeter(player: Hive): CombatMeter | null {
  const swarm = player.swarm;
  return swarm ? { id: 'hive', label: 'Hive', value: swarm.count, max: swarm.cap } : null;
}

/** The fight screen's meters: the field's, if one is cast, and whatever pools the player carries. */
export function metersOf(field: CombatMeter | null, player: Hive & Dusty): CombatMeter[] {
  return [field, hiveMeter(player), dustMeter(player)].flatMap((m) => (m ? [m] : []));
}

/** What is left of each pool as the fight ends, for the outcome. */
export function poolsLeft(player: Hive & Dusty): Pick<CombatOutcome, 'swarm' | 'dust'> {
  return {
    ...(player.swarm ? { swarm: player.swarm.count } : {}),
    ...(player.dust ? { dust: player.dust.count } : {}),
  };
}
