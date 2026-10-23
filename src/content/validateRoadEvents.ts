import type { ContentPack } from './types';

/**
 * Road events (`docs/design/journeys-plan.md` 3.5): every region a road or a job's leg crosses
 * keeps at least one event that any road brings in any season, so no stretch goes silent for
 * good just because the road is safe or the season is wrong.
 */
export function validateRoadEvents(pack: ContentPack): string[] {
  const always = new Set(
    pack.roadEvents.filter((e) => !e.danger && !e.seasons && !e.once).flatMap((e) => e.regions),
  );
  const crossed = new Set([
    ...pack.routes.flatMap((r) => r.legs.map((l) => l.region)),
    ...pack.missions.flatMap((m) =>
      m.stages.flatMap((s) => (s.kind === 'leg' && s.region ? [s.region] : [])),
    ),
  ]);
  return [...crossed]
    .filter((region) => !always.has(region))
    .map((region) => `region "${region}" has no road event for every road and season`);
}
