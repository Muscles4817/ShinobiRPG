import type { CombatantView, CombatMeter, CombatOutcome } from '../../contract';
import { isBodyMove, maxBreath } from '../../rules/breath';
import { breathOf } from './effort';
import { dustMeter } from './dust';
import type { Dusty } from './dustBody';
import type { Hive } from './hive';
import type { PlanFighter } from './state';

/** Fighters' pools on the fight screen and in the outcome: breath, a hive and dust. */

/** The player's hive on the fight screen, beside their chakra: how many insects are left. */
export function hiveMeter(player: Hive): CombatMeter | null {
  const swarm = player.swarm;
  return swarm ? { id: 'hive', label: 'Hive', value: swarm.count, max: swarm.cap } : null;
}

/** A fighter's breath: what their stamina leaves for body moves. */
function breath(fighter: Breathing): CombatMeter {
  return {
    id: 'breath',
    label: 'Breath',
    value: breathOf(fighter),
    max: maxBreath(fighter.attributes),
  };
}

/** The player's breath, beside their chakra, when they know a body move to spend it on. */
export function breathMeter(player: Breathing): CombatMeter | null {
  return player.techniques.some(isBodyMove) ? breath(player) : null;
}

type Breathing = Pick<PlanFighter, 'techniques' | 'attributes' | 'breath'>;

/** A fighter's pools as amounts by id (chakra, breath, and a hive or dust if they carry one). */
export function poolAmounts(
  fighter: Hive & Dusty & Breathing & Pick<PlanFighter, 'chakra'>,
): Record<string, number> {
  const pools: Record<string, number> = { chakra: fighter.chakra, breath: breathOf(fighter) };
  if (fighter.swarm) pools.hive = fighter.swarm.count;
  if (fighter.dust) pools.dust = fighter.dust.count;
  return pools;
}

/** Where a fighter stands and the pools they carry, for their view. */
export function onStage(
  fighter: Hive & Dusty & Breathing & Pick<PlanFighter, 'row'>,
): Pick<CombatantView, 'row' | 'meters'> {
  // Everyone breathes, so a watcher sees each fighter's stamina whether or not they spend it.
  const pools = [hiveMeter(fighter), dustMeter(fighter)].flatMap((m) => (m ? [m] : []));
  return { row: fighter.row, meters: [breath(fighter), ...pools] };
}

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
