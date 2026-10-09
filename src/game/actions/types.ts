import type { Rng } from '@/core';

import type { GameContext } from '../context';
import type { GameState } from '../state';

/**
 * Every thing the player can do, as data. The UI dispatches these; tests replay them.
 * Adding a verb: add a variant here, write a handler file, register it in `registry.ts`
 * (the compiler will insist).
 */
export type GameAction =
  | { readonly type: 'train'; readonly trainingId: string }
  | { readonly type: 'eat'; readonly foodId: string }
  | { readonly type: 'rest' }
  | { readonly type: 'sleep' }
  | { readonly type: 'payRent' }
  | { readonly type: 'treat' }
  | { readonly type: 'travel'; readonly locationId: string }
  | { readonly type: 'dismissReport' }
  | { readonly type: 'study'; readonly techniqueId: string }
  | { readonly type: 'startMission'; readonly missionId: string }
  | { readonly type: 'missionChoose'; readonly approachIndex: number }
  | { readonly type: 'missionContinue' }
  | { readonly type: 'combatAct'; readonly optionId: string; readonly targetId?: string }
  | { readonly type: 'assignTeam' }
  | { readonly type: 'chooseSensei'; readonly senseiId: string }
  | { readonly type: 'talk'; readonly personId: string }
  | { readonly type: 'reply'; readonly choiceIndex: number }
  | { readonly type: 'endConversation' }
  | { readonly type: 'lesson' }
  | { readonly type: 'spar'; readonly personId: string }
  | { readonly type: 'setCombatStyle'; readonly style: string }
  | { readonly type: 'buyGear'; readonly gearId: string }
  | { readonly type: 'equipGear'; readonly gearId: string }
  | { readonly type: 'unequipGear'; readonly slot: string }
  | { readonly type: 'buyIngredient'; readonly ingredientId: string }
  | { readonly type: 'cook'; readonly recipeId: string };

export type GameActionType = GameAction['type'];
export type ActionOf<T extends GameActionType> = Extract<GameAction, { type: T }>;

export interface ActionHandler<A extends GameAction> {
  /** Why the action can't be done right now, or null if it can. Must be side-effect free. */
  check(state: GameState, action: A, ctx: GameContext): string | null;
  /** Performs a checked action. May assume `check` returned null. */
  perform(state: GameState, action: A, ctx: GameContext, rng: Rng): GameState;
}
