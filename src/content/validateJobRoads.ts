import { MIN_RYO_PER_DAY_AWAY, type MissionDef } from '@/systems/missions';
import { findJourney } from '@/systems/travel';

import type { ContentPack } from './types';

/**
 * Jobs on the map (`docs/design/journeys-plan.md` 3.7): a job whose road goes out names where
 * (`goesTo`, a real place), and only such a job does; from every hall that posts it each of its
 * roads has a way along the pack's routes; it ends where its last road leaves you (`endsAt`, so
 * everything that reads where a job ends still can); and it pays for the days its roads keep you
 * away, as a job walking its own legs must.
 */
export function validateJobRoads(pack: ContentPack): string[] {
  return pack.missions.flatMap((m) => jobRoadProblems(pack, m));
}

/** The towns whose halls post the job. */
function postedFrom(pack: ContentPack, id: string): string[] {
  return pack.locations
    .filter((l) => l.places.some((p) => p.kind === 'missions' && p.missionIds.includes(id)))
    .map((l) => l.id);
}

function goesToProblems(pack: ContentPack, m: MissionDef, outbound: boolean): string[] {
  const where = `mission "${m.id}"`;
  if (!m.goesTo) return outbound ? [`${where} has a road out but nowhere it goes to`] : [];
  if (!pack.locations.some((l) => l.id === m.goesTo))
    return [`${where} goes to unknown location "${m.goesTo}"`];
  return outbound ? [] : [`${where} goes to "${m.goesTo}" with no road out`];
}

/** Where each road heads: out to where the job goes, or home to the start village. */
function headings(pack: ContentPack, m: MissionDef): string[] {
  return m.stages.flatMap((s) =>
    s.kind !== 'road' ? [] : [s.to === 'home' ? pack.startLocationId : (m.goesTo ?? '')],
  );
}

/** The days the job's roads keep you away from a hall, or null when some road has no way. */
function roadDays(pack: ContentPack, m: MissionDef, hall: string): number | null {
  let from = hall;
  let days = 0;
  for (const to of headings(pack, m)) {
    const journey = from === to ? null : findJourney(pack.routes, from, to);
    if (!journey) return null;
    days += journey.days;
    from = to;
  }
  return days;
}

function jobRoadProblems(pack: ContentPack, m: MissionDef): string[] {
  const where = `mission "${m.id}"`;
  const heads = headings(pack, m);
  const problems = goesToProblems(
    pack,
    m,
    m.stages.some((s) => s.kind === 'road' && s.to === 'outbound'),
  );
  if (heads.length === 0 || problems.length > 0) return problems;
  const last = heads.at(-1);
  const ends =
    m.endsAt === last ? [] : [`${where} should end where its last road leaves you, "${last}"`];
  const legDays = m.stages.reduce((sum, s) => sum + (s.kind === 'leg' ? s.days : 0), 0);
  const halls = postedFrom(pack, m.id).map((hall) => ({ hall, days: roadDays(pack, m, hall) }));
  return [
    ...ends,
    ...halls.flatMap(({ hall, days }) =>
      days === null
        ? [`${where} has no way along the roads from "${hall}"`]
        : m.reward.ryo < (days + legDays) * MIN_RYO_PER_DAY_AWAY
          ? [`${where} pays too little for ${days + legDays} days away from "${hall}"`]
          : [],
    ),
  ];
}
