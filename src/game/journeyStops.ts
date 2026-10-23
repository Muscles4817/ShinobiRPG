import type { LandmarkSight, LocationDef, PlaceDef } from '@/content';

import { hasBeenTo } from './atlas';
import type { GameContext } from './context';
import { priceAt } from './greetings';
import type { GameState } from './state';

/**
 * Places on the way (`docs/design/journeys-plan.md` 3.3). A trip passes the towns, landmarks and
 * wild country between its stretches, and each may be stopped at: a town or city for a night at
 * its inn instead of camp, a landmark for its sight, wild country for a day spent in it. What a
 * place offers is read from its kind, so a new location on a road is a new stop with no code.
 */

type InnPlace = Extract<PlaceDef, { readonly kind: 'inn' }>;
type WildsPlace = Extract<PlaceDef, { readonly kind: 'wilds' }>;

/** What a place on the way offers. */
export type StopOffer =
  | { readonly kind: 'inn'; readonly location: LocationDef; readonly inn: InnPlace }
  | { readonly kind: 'sight'; readonly location: LocationDef; readonly sight: LandmarkSight }
  | { readonly kind: 'wild'; readonly location: LocationDef; readonly wilds: WildsPlace };

function innOf(location: LocationDef): InnPlace | null {
  return location.places.find((p): p is InnPlace => p.kind === 'inn') ?? null;
}

function wildsOf(location: LocationDef): WildsPlace | null {
  return location.places.find((p): p is WildsPlace => p.kind === 'wilds') ?? null;
}

/** What stopping at a place on the way would offer, or null if it offers nothing to stop for. */
export function stopOffer(location: LocationDef): StopOffer | null {
  if (location.kind === 'landmark')
    return location.sight ? { kind: 'sight', location, sight: location.sight } : null;
  if (location.kind === 'wild') {
    const wilds = wildsOf(location);
    return wilds ? { kind: 'wild', location, wilds } : null;
  }
  const inn = innOf(location);
  return inn ? { kind: 'inn', location, inn } : null;
}

/** The stop at a location on the way, from content. */
export function stopAt(ctx: GameContext, locationId: string): StopOffer | null {
  const location = ctx.content.locations.get(locationId);
  return location ? stopOffer(location) : null;
}

/** What a room costs at a stop's inn, its town's grudges included. */
export function roomPrice(state: GameState, ctx: GameContext, offer: StopOffer): number {
  return offer.kind === 'inn' ? priceAt(offer.inn.roomCost, state, ctx, offer.location.id) : 0;
}

/** A trip's legs, as planned: each heads somewhere. */
type PlannedLegs = readonly { readonly toward?: string }[];

/**
 * Where a trip will stop: every place it passes between stretches that offers a stop, or, when
 * hurrying, only the landmarks you have never seen.
 */
export function plannedStops(
  state: GameState,
  ctx: GameContext,
  legs: PlannedLegs,
  quick: boolean,
): string[] {
  return legs.flatMap((leg, i) => {
    const here = leg.toward;
    if (!here || i === legs.length - 1 || legs[i + 1]?.toward === here) return [];
    const offer = stopAt(ctx, here);
    if (!offer) return [];
    const unseen = offer.kind === 'sight' && !hasBeenTo(state, ctx, here);
    return !quick || unseen ? [here] : [];
  });
}
