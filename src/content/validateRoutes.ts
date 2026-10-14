import { DANGERS } from '@/systems/missions';
import { reachableFrom, type RouteDef } from '@/systems/travel';

import { duplicateIds } from './catalog';
import type { ContentPack } from './types';

/**
 * Checks the roads: both ends are real places, every leg is days through a region that has
 * road events, and every location can be reached from the start (a place with no road to it
 * would sit on the Travel tab forever).
 */
export function validateRoutes(pack: ContentPack): string[] {
  const locations = new Set(pack.locations.map((l) => l.id));
  const regions = new Set(pack.roadEvents.flatMap((e) => e.regions));
  const reached = reachableFrom(pack.routes, pack.startLocationId);
  return [
    ...duplicateIds(pack.routes).map((id) => `duplicate route id "${id}"`),
    ...pack.routes.flatMap((r) => routeProblems(r, locations, regions)),
    ...pack.locations
      .filter((l) => !reached.has(l.id))
      .map((l) => `location "${l.id}" has no road to it from the start`),
  ];
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
    ...route.legs
      .filter((leg) => !regions.has(leg.region))
      .map((leg) => `${at} crosses region "${leg.region}", which has no road events`),
    ...(DANGERS.includes(route.danger) ? [] : [`${at} has an unknown danger`]),
    ...((route.cost ?? 0) < 0 ? [`${at} has a negative cost`] : []),
  ];
}
