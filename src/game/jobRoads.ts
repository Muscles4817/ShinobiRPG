import type { MissionDef, MissionStage, RoadStage, WayLeg } from '@/systems/missions';
import { findJourney, type RouteDef } from '@/systems/travel';

import type { GameContext } from './context';
import { homeVillageId } from './homeVillage';
import { CAMP } from './journeys';
import { roadOpen } from './routeNeeds';
import type { GameState } from './state';

/**
 * Jobs on the map (`docs/design/journeys-plan.md` 3.7). A job's `road` stage is the quickest open
 * way out to where it `goesTo`, or home to your village from where the road before left you. The
 * ways are worked out when the job is taken and kept on the run (`MissionRun.ways`), so a road
 * that opens or closes while you are out doesn't move you; then each road is walked as its legs,
 * a camp between stretches, with the map's road events on them as on a trip.
 */

function isRoad(stage: MissionStage): stage is RoadStage & MissionStage {
  return stage.kind === 'road';
}

/** Whether a job walks the map's road rather than legs of its own. */
export function walksTheMap(def: Pick<MissionDef, 'stages'>): boolean {
  return def.stages.some(isRoad);
}

/** Where a road of the job heads: out to where the job goes, or home. */
function headingFor(state: GameState, ctx: GameContext, def: MissionDef, road: RoadStage): string {
  return road.to === 'home' ? homeVillageId(state, ctx) : (def.goesTo ?? state.locationId);
}

/**
 * The legs of every road the job walks, from where you stand, in order; null when some road has
 * no open way (a road closed to you, or nowhere to go).
 */
export function jobWays(
  state: GameState,
  ctx: GameContext,
  def: MissionDef,
): (readonly WayLeg[])[] | null {
  const open = (r: RouteDef) => roadOpen(state, ctx, r);
  const ways: (readonly WayLeg[])[] = [];
  let from = state.locationId;
  for (const road of def.stages.filter(isRoad)) {
    const to = headingFor(state, ctx, def, road);
    const journey = from === to ? null : findJourney(ctx.content.routes.all, from, to, open);
    if (!journey) return null;
    ways.push(journey.legs);
    from = to;
  }
  return ways;
}

/** A road as the stages it is walked as: its legs, with a camp between one stretch and the next. */
function walked(road: RoadStage & MissionStage, legs: readonly WayLeg[]): MissionStage[] {
  return legs.flatMap((leg, i): MissionStage[] => {
    const walk: MissionStage = {
      kind: 'leg',
      text: i === 0 && road.text ? road.text : leg.text,
      days: leg.days,
      region: leg.region,
      danger: leg.danger,
      ...(road.when ? { when: road.when } : {}),
    };
    const camp = road.when ? { ...CAMP, when: road.when } : CAMP;
    return i === legs.length - 1 ? [walk] : [walk, camp];
  });
}

/** The job with its roads laid out as legs; a job with no roads of its own is as written. */
export function withRoads(def: MissionDef, ways: readonly (readonly WayLeg[])[]): MissionDef {
  if (!walksTheMap(def)) return def;
  let road = 0;
  const stages = def.stages.flatMap((stage) =>
    isRoad(stage) ? walked(stage, ways[road++] ?? []) : [stage],
  );
  return { ...def, stages };
}

/**
 * The job as it is walked: on its run, the ways kept when it was taken (or, for a run taken before
 * they were kept, today's); on the board, the ways it would take from where you stand.
 */
export function jobAsWalked(state: GameState, ctx: GameContext, def: MissionDef): MissionDef {
  if (!walksTheMap(def)) return def;
  const run = state.mission?.missionId === def.id ? state.mission : null;
  return withRoads(def, run?.ways ?? jobWays(state, ctx, def) ?? []);
}
