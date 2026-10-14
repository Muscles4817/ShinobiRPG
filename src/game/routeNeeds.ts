import { RANK_LABELS, rankAtLeast } from '@/systems/standing';
import { unmetNeed, type RouteDef, type RouteNeed } from '@/systems/travel';

import type { GameContext } from './context';
import type { GameState } from './state';
import { canWalk, walkingTakes } from './walking';

/**
 * Whether a road is open to you. A road is closed while a place at either end is still
 * locked (coming soon), or while you don't meet what it needs: a rank, something the village
 * remembers, or a surface walked on chakra (asked of `canWalk`, never of stats here).
 */

function needMet(state: GameState, ctx: GameContext, need: RouteNeed): boolean {
  switch (need.kind) {
    case 'rank':
      return rankAtLeast(state.standing.rank, need.rank);
    case 'worldMark':
      return state.village.marks.includes(need.mark);
    case 'walk':
      return canWalk(state, ctx, need.surface);
  }
}

/** What a need asks, as a phrase after "needs". */
function needPhrase(need: RouteNeed): string {
  switch (need.kind) {
    case 'rank':
      return `${RANK_LABELS[need.rank]} rank`;
    case 'worldMark':
      return need.text;
    case 'walk':
      return walkingTakes(need.surface);
  }
}

/** Neither end is a place still coming soon. */
export function endsOpen(route: RouteDef, ctx: GameContext): boolean {
  return [route.from, route.to].every(
    (id) => ctx.content.locations.get(id)?.lockedReason === undefined,
  );
}

/** The first need of the road you don't meet, or null. */
function unmetBy(state: GameState, ctx: GameContext, route: RouteDef): RouteNeed | null {
  return unmetNeed(route, (need) => needMet(state, ctx, need));
}

/** A road you could walk today. */
export function roadOpen(state: GameState, ctx: GameContext, route: RouteDef): boolean {
  return endsOpen(route, ctx) && unmetBy(state, ctx, route) === null;
}

/**
 * Why a road whose ends are open is closed to you, as a sentence ("The bay crossing needs
 * water-walking: chakra control at grade C."), or null when nothing you lack closes it.
 */
export function closedBy(state: GameState, ctx: GameContext, route: RouteDef): string | null {
  const need = unmetBy(state, ctx, route);
  if (need === null || !endsOpen(route, ctx)) return null;
  return `${route.name ?? 'The road'} needs ${needPhrase(need)}.`;
}
