import { DANGERS, type MissionDef } from '@/systems/missions';
import { RANKS } from '@/systems/standing';
import { reachableFrom, WALK_SURFACES, type RouteDef, type RouteNeed } from '@/systems/travel';

import { duplicateIds } from './catalog';
import { MAP_SIZE } from './art';
import type { ContentPack } from './types';
import { worldMarksLeft } from './validateStory';

/**
 * Checks the roads: both ends are real places, every leg is days through a region that has
 * road events, every location can be reached from the start (a place with no road to it
 * would sit on the Travel tab forever), and a road's needs are real: a rank that exists, a
 * world mark some job leaves behind, a surface one can walk on, and a name to say it by.
 */
export function validateRoutes(pack: ContentPack): string[] {
  const locations = new Set(pack.locations.map((l) => l.id));
  const regions = new Set(pack.roadEvents.flatMap((e) => e.regions));
  const reached = reachableFrom(pack.routes, pack.startLocationId);
  const marks = worldMarksLeft(pack);
  return [
    ...duplicateIds(pack.routes).map((id) => `duplicate route id "${id}"`),
    ...pack.routes.flatMap((r) => routeProblems(r, locations, regions)),
    ...pack.routes.flatMap((r) => needsProblems(r, marks)),
    ...pack.locations
      .filter((l) => !reached.has(l.id))
      .map((l) => `location "${l.id}" has no road to it from the start`),
    ...pack.missions.flatMap((m) => endsAtProblems(pack, m)),
    ...pack.locations
      .filter((l) => !onTheMap(l.map))
      .map((l) => `location "${l.id}" is off the map`),
  ];
}

/** A job that leaves you somewhere else walks you there, to a place you can be. */
function endsAtProblems(pack: ContentPack, job: MissionDef): string[] {
  if (job.endsAt === undefined) return [];
  const place = pack.locations.find((l) => l.id === job.endsAt);
  if (!place) return [`mission "${job.id}" ends at unknown location "${job.endsAt}"`];
  return [
    ...(place.lockedReason !== undefined
      ? [`mission "${job.id}" ends somewhere still locked`]
      : []),
    ...(job.stages.some((s) => s.kind === 'leg')
      ? []
      : [`mission "${job.id}" ends elsewhere without a road`]),
  ];
}

/** A place sits inside the map. */
function onTheMap(at: { readonly x: number; readonly y: number }): boolean {
  return at.x >= 0 && at.x <= MAP_SIZE.width && at.y >= 0 && at.y <= MAP_SIZE.height;
}

function routeProblems(
  route: RouteDef,
  locations: ReadonlySet<string>,
  regions: ReadonlySet<string>,
): string[] {
  const at = `route "${route.id}"`;
  return [
    ...[route.from, route.to]
      .filter((id) => !locations.has(id))
      .map((id) => `${at} ends at unknown location "${id}"`),
    ...(route.from === route.to ? [`${at} goes nowhere`] : []),
    ...(route.legs.length === 0 ? [`${at} has no legs`] : []),
    ...route.legs
      .filter((leg) => !Number.isInteger(leg.days) || leg.days < 1)
      .map((leg) => `${at} has a leg through "${leg.region}" of under a day`),
    ...(route.legs.some((leg) => leg.text.trim() === '') ? [`${at} has a leg with no text`] : []),
    ...route.legs
      .filter((leg) => !regions.has(leg.region))
      .map((leg) => `${at} crosses region "${leg.region}", which has no road events`),
    ...(DANGERS.includes(route.danger) ? [] : [`${at} has an unknown danger`]),
    ...((route.cost ?? 0) < 0 ? [`${at} has a negative cost`] : []),
  ];
}

function needProblem(need: RouteNeed, marks: ReadonlySet<string>): string | null {
  switch (need.kind) {
    case 'rank':
      return RANKS.includes(need.rank) ? null : `needs unknown rank "${need.rank}"`;
    case 'worldMark':
      if (need.text.trim() === '') return `needs world mark "${need.mark}" with no words for it`;
      return marks.has(need.mark) ? null : `needs "${need.mark}", which no job leaves behind`;
    case 'walk':
      return WALK_SURFACES.includes(need.surface)
        ? null
        : `needs walking on unknown surface "${need.surface}"`;
  }
}

function needsProblems(route: RouteDef, marks: ReadonlySet<string>): string[] {
  const needs = route.needs ?? [];
  const at = `route "${route.id}"`;
  return [
    ...(route.needs !== undefined && needs.length === 0 ? [`${at} has an empty needs list`] : []),
    ...(needs.length > 0 && (route.name ?? '').trim() === ''
      ? [`${at} has needs but no name to tell the player`]
      : []),
    ...needs.flatMap((need) => {
      const problem = needProblem(need, marks);
      return problem === null ? [] : [`${at} ${problem}`];
    }),
  ];
}
