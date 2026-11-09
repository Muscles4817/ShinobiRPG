import { learnOf, NEW_ATLAS, visit, type Atlas } from '@/systems/travel';

import type { GameContext } from './context';
import { homeVillageId } from './homeVillage';
import type { GameState } from './state';

/**
 * The map as you know it (`docs/design/journeys-plan.md` 3.4). A place is on your map when it is
 * famous, when you've heard of it (a job that goes there, a road you planned through it, a road
 * from somewhere you've been) or when you've stood in it. Your home village and where you stand
 * are always known and always been to.
 */

/** Whether a place is on your map. */
export function knowsOf(state: GameState, ctx: GameContext, id: string): boolean {
  if (ctx.content.locations.get(id)?.famous === true) return true;
  return state.atlas.known.includes(id) || hasBeenTo(state, ctx, id);
}

/** Whether you've stood in a place. */
export function hasBeenTo(state: GameState, ctx: GameContext, id: string): boolean {
  return (
    id === state.locationId || id === homeVillageId(state, ctx) || state.atlas.visited.includes(id)
  );
}

/** Places heard of. */
export function hearOf(state: GameState, ids: readonly string[]): GameState {
  const atlas = learnOf(state.atlas, ids);
  return atlas === state.atlas ? state : { ...state, atlas };
}

/** The places a road joins to this one. */
export function neighbours(ctx: GameContext, id: string): string[] {
  return ctx.content.routes.all.flatMap((r) =>
    r.from === id ? [r.to] : r.to === id ? [r.from] : [],
  );
}

/** Somewhere stood in: been there, and the places its roads lead to heard of. */
export function beenTo(state: GameState, ctx: GameContext, id: string): GameState {
  const atlas = learnOf(visit(state.atlas, id), neighbours(ctx, id));
  return atlas === state.atlas ? state : { ...state, atlas };
}

/** After any action that left you somewhere new (a trip's end, a job that ended away). */
export function noteArrival(before: GameState, after: GameState, ctx: GameContext): GameState {
  return after.locationId === before.locationId ? after : beenTo(after, ctx, after.locationId);
}

/** A new life's map: the places one road from home are heard of from childhood. */
export function homeAtlas(ctx: GameContext): Atlas {
  return learnOf(NEW_ATLAS, neighbours(ctx, ctx.content.startLocationId));
}
