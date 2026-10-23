import type { ContentPack } from './types';
import { validateLocationKinds } from './validateLocationKinds';
import { validateRoadEvents } from './validateRoadEvents';
import { validateRoutes } from './validateRoutes';

/** The world a trip crosses: its roads, what each kind of place must have, and the road's events. */
export function validateTravel(pack: ContentPack): string[] {
  return [...validateRoutes(pack), ...validateLocationKinds(pack), ...validateRoadEvents(pack)];
}
