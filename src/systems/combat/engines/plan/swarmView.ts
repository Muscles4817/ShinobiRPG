import type { CombatMeter } from '../../contract';
import type { Hive } from './hive';

/** The player's hive on the fight screen, beside their chakra: how many insects are left. */
export function hiveMeter(player: Hive): CombatMeter | null {
  const swarm = player.swarm;
  return swarm ? { id: 'hive', label: 'Hive', value: swarm.count, max: swarm.cap } : null;
}
