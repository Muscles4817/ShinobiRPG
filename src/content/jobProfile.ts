import { stageFoes, worstDanger, type JobProfile, type MissionDef } from '@/systems/missions';

import type { EnemyDef } from './types';

/**
 * A job as the assignment rules see it: its rank and the danger of its worst foe. An unknown
 * enemy id counts as elite, so a typo never sends anyone out alone (validation reports it).
 */
export function jobProfile(
  def: Pick<MissionDef, 'rank' | 'stages'>,
  enemy: (id: string) => EnemyDef | undefined,
): JobProfile {
  const danger = worstDanger(def.stages.flatMap(stageFoes), (id) => enemy(id)?.danger ?? 'elite');
  return { rank: def.rank, danger };
}
