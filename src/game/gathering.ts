import type { PlaceDef } from '@/content';
import { cookingGrade, findsNow, type Find, type GatherMoment } from '@/systems/cooking';
import { seasonOf, slotName } from '@/systems/time';

import type { GameContext } from './context';
import { placesHere } from './ops';
import type { GameState } from './state';

/**
 * The game's side of gathering: which wild place you mean, what could turn up there right now,
 * and the keys gathering is remembered by (a place, or a place's fishing spot).
 */

export type WildsDef = Extract<PlaceDef, { kind: 'wilds' }>;

export function wildsHere(state: GameState, ctx: GameContext, placeId: string): WildsDef | null {
  return placesHere(state, ctx, 'wilds').find((p) => p.id === placeId) ?? null;
}

export function gatherMoment(state: GameState): GatherMoment {
  return {
    season: seasonOf(state.time.day),
    slot: slotName(state.time),
    grade: cookingGrade(state.cooking.xp),
  };
}

/** What could turn up now from these finds. */
export function findsHereNow(state: GameState, finds: readonly Find[]): Find[] {
  return findsNow(finds, gatherMoment(state));
}

export function spotKey(placeId: string, spotId: string): string {
  return `${placeId}:${spotId}`;
}
