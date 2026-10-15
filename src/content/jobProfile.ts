import { stageFoes, worstDanger, type JobProfile, type MissionDef } from '@/systems/missions';

import type { EnemyDef, LocationDef } from './types';

/**
 * A job as the assignment rules see it: its rank, the danger of its worst foe, and whether it
 * takes you out of the village. An unknown enemy id counts as elite, so a typo never sends
 * anyone out alone (validation reports it).
 */
export function jobProfile(
  def: Pick<MissionDef, 'rank' | 'stages' | 'endsAt'>,
  enemy: (id: string) => EnemyDef | undefined,
  postedAway = false,
): JobProfile {
  const danger = worstDanger(def.stages.flatMap(stageFoes), (id) => enemy(id)?.danger ?? 'elite');
  const away = postedAway || def.endsAt !== undefined || def.stages.some((s) => s.kind === 'leg');
  return { rank: def.rank, danger, away };
}

/**
 * Whether a job is only ever posted outside the start village (an arc act based in another
 * town), so taking it means being away even when it has no road of its own.
 */
export function postedAway(
  locations: readonly LocationDef[],
  startLocationId: string,
  missionId: string,
): boolean {
  const halls = locations.filter((l) =>
    l.places.some((p) => p.kind === 'missions' && p.missionIds.includes(missionId)),
  );
  return halls.length > 0 && halls.every((l) => l.id !== startLocationId);
}
