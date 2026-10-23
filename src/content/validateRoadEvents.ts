import {
  dangerAtLeast,
  isDecisionEvent,
  type EncounterRoadEvent,
  type RoadEventDef,
} from '@/systems/missions';

import type { ContentPack } from './types';

/**
 * Road events (`docs/design/journeys-plan.md` 3.5): every region a road or a job's leg crosses
 * and has events keeps at least one that any road brings in any season, on a job or a trip, so
 * no stretch goes silent for good just because the road is safe or the season is wrong. Each
 * kind's own parts are real: foes, the encounter they're met through, finds, and weather and
 * sights that cost and teach something.
 */
export function validateRoadEvents(pack: ContentPack): string[] {
  return [...regionProblems(pack), ...pack.roadEvents.flatMap((e) => kindProblems(pack, e))];
}

function regionProblems(pack: ContentPack): string[] {
  const any = new Set(pack.roadEvents.flatMap((e) => e.regions));
  const always = new Set(
    pack.roadEvents
      // Foes come only on trips, so they don't keep a job's road from going silent.
      .filter((e) => !e.danger && !e.seasons && !e.once && e.kind !== 'encounter')
      .flatMap((e) => e.regions),
  );
  const crossed = new Set([
    ...pack.routes.flatMap((r) => r.legs.map((l) => l.region)),
    ...pack.missions.flatMap((m) =>
      m.stages.flatMap((s) => (s.kind === 'leg' && s.region ? [s.region] : [])),
    ),
  ]);
  return (
    [...crossed]
      // A region with no events at all is the routes' and the jobs' own problem to report.
      .filter((region) => any.has(region) && !always.has(region))
      .map((region) => `region "${region}" has no road event for every road and season`)
  );
}

/** Foes that exist, an encounter that does, and a band the least road it comes on may bring. */
function encounterProblems(pack: ContentPack, event: EncounterRoadEvent, where: string): string[] {
  const dangerOf = new Map(pack.enemies.map((e) => [e.id, e.danger]));
  const unknown = event.parties.flat().filter((id) => !dangerOf.has(id));
  if (unknown.length > 0) return unknown.map((id) => `${where} names unknown foe "${id}"`);
  const least = event.danger ?? 'petty';
  const fits = event.parties.some((party) =>
    party.every((id) => dangerAtLeast(least, dangerOf.get(id) ?? 'elite')),
  );
  return [
    ...(pack.encounters.some((t) => t.id === event.template)
      ? []
      : [`${where} names unknown encounter "${event.template}"`]),
    ...(fits ? [] : [`${where} has no band of foes a ${least} road may bring`]),
  ];
}

function kindProblems(pack: ContentPack, event: RoadEventDef): string[] {
  if (isDecisionEvent(event)) return [];
  const where = `road event "${event.id}"`;
  switch (event.kind) {
    case 'encounter':
      return encounterProblems(pack, event, where);
    case 'find':
      // That they are real ingredients is the world's to check, with every other source.
      return event.ingredientIds.length === 0 ? [`${where} finds nothing`] : [];
    case 'weather':
      return event.wait.slots >= 1 && event.push.energy > 0 && event.push.health > 0
        ? []
        : [`${where} costs nothing to wait out or push through`];
    case 'sight':
      return Object.values(event.reward).some((v) => v > 0) ? [] : [`${where} teaches nothing`];
  }
}
