import type { ContentPack } from './types';
import { validateJobRoads } from './validateJobRoads';
import { validateLocationKinds } from './validateLocationKinds';
import { validateRoadEvents } from './validateRoadEvents';
import { validateRoutes } from './validateRoutes';
import { validateTravellers } from './validateTravellers';

/**
 * The world a trip crosses: its roads, what each kind of place must have, the road's events, the
 * people met on it and the jobs that walk it.
 */
export function validateTravel(pack: ContentPack): string[] {
  return [
    ...validateRoutes(pack),
    ...validateLocationKinds(pack),
    ...validateRoadEvents(pack),
    ...validateTravellers(pack),
    ...validateJobRoads(pack),
  ];
}
