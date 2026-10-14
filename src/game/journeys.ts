import { findJourney, type Journey, type RouteDef } from '@/systems/travel';

import type { GameContext } from './context';
import type { GameState } from './state';

/**
 * The way from where you are to a location, over the pack's routes. A road is open when
 * neither end is locked (a waypoint that is still "coming soon" closes the road through it).
 */

function isOpen(route: RouteDef, ctx: GameContext): boolean {
  return [route.from, route.to].every(
    (id) => ctx.content.locations.get(id)?.lockedReason === undefined,
  );
}

/** The quickest open way there, or null if no open road goes there. */
export function journeyTo(state: GameState, ctx: GameContext, locationId: string): Journey | null {
  return findJourney(ctx.content.routes.all, state.locationId, locationId, (r) => isOpen(r, ctx));
}

/** The way there once every road is open: what the Travel tab shows for a place still locked. */
export function plannedJourneyTo(
  state: GameState,
  ctx: GameContext,
  locationId: string,
): Journey | null {
  return findJourney(ctx.content.routes.all, state.locationId, locationId);
}
