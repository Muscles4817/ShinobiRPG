import type { Rng } from '@/core';
import type { MapStyle } from '../mapStyle';
import type { RangeBand } from '@/systems/combat';
import type { CookingSteps } from '@/systems/cooking';
import type { ApproachId, ReconId } from '@/systems/missions';
import type { MindApproach } from '../exam/mind';
import type { Replacement } from '../exam/entry';
import type { StatId } from '@/systems/stats';

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
  /** A night at the inn here. */
  | { readonly type: 'takeRoom' }
  /** A session of a chakra control exercise (tree-walking) at a training place. */
  | { readonly type: 'practise'; readonly exerciseId: string }
  /** Buy the house for sale here. */
  | { readonly type: 'buyHouse' }
  | { readonly type: 'payRent' }
  | { readonly type: 'treat' }
  /**
   * `quick`: walk on without stopping to camp; only a road event halts you. `companionId`: a
   * friend you ask along.
   */
  | {
      readonly type: 'travel';
      readonly locationId: string;
      readonly quick?: boolean;
      readonly companionId?: string;
    }
  /** At a camp on a trip of your own: walk back the way you came. */
  | { readonly type: 'turnBack' }
  | { readonly type: 'dismissReport' }
  | { readonly type: 'leaveFight' }
  | { readonly type: 'study'; readonly techniqueId: string }
  | { readonly type: 'studyScroll'; readonly techniqueId: string }
  | { readonly type: 'startMission'; readonly missionId: string }
  | { readonly type: 'missionChoose'; readonly approachIndex: number }
  | { readonly type: 'missionContinue' }
  | { readonly type: 'missionDecide'; readonly optionIndex: number }
  | { readonly type: 'missionCamp'; readonly activityIndex: number }
  | { readonly type: 'encounterRecon'; readonly recon: ReconId }
  | {
      readonly type: 'encounterApproach';
      readonly approach: ApproachId;
      readonly range?: RangeBand;
    }
  | { readonly type: 'combatAct'; readonly optionId: string; readonly targetId?: string }
  | { readonly type: 'assignTeam' }
  | { readonly type: 'chooseSensei'; readonly senseiId: string }
  | { readonly type: 'testChakraPaper' }
  | { readonly type: 'talk'; readonly personId: string }
  | { readonly type: 'reply'; readonly choiceIndex: number }
  | { readonly type: 'endConversation' }
  | { readonly type: 'trainWith'; readonly personId: string; readonly statId: StatId }
  | { readonly type: 'senseiSession' }
  | { readonly type: 'senseiTest'; readonly optionIndex: number }
  | { readonly type: 'heedSensei' }
  | { readonly type: 'teamDay' }
  | { readonly type: 'spar'; readonly personId: string }
  | { readonly type: 'setCombatStyle'; readonly style: string }
  | { readonly type: 'setAnimations'; readonly on: boolean }
  | { readonly type: 'setMapStyle'; readonly style: MapStyle }
  | { readonly type: 'buyGear'; readonly gearId: string }
  | { readonly type: 'buyTool'; readonly toolId: string }
  | { readonly type: 'buyIntel'; readonly missionId: string }
  | { readonly type: 'equipGear'; readonly gearId: string }
  | { readonly type: 'unequipGear'; readonly slot: string }
  | { readonly type: 'buyIngredient'; readonly ingredientId: string }
  /** Cooked by hand at the stove when `steps` are given, else as usual. */
  | { readonly type: 'cook'; readonly recipeId: string; readonly steps?: CookingSteps }
  | { readonly type: 'experiment'; readonly ingredientIds: readonly string[] }
  | { readonly type: 'forage'; readonly placeId: string }
  | { readonly type: 'fish'; readonly placeId: string; readonly spotId: string }
  | { readonly type: 'buyCookbook'; readonly cookbookId: string }
  | { readonly type: 'learnRecipe'; readonly personId: string }
  | { readonly type: 'followSight' }
  | { readonly type: 'hostDinner'; readonly recipeId: string; readonly guestId: string }
  | { readonly type: 'buyRound' }
  | { readonly type: 'enterExam'; readonly replacements?: readonly Replacement[] }
  | { readonly type: 'examAnswer'; readonly approach: MindApproach }
  | { readonly type: 'examFinal'; readonly stay: boolean }
  | { readonly type: 'examContinue' }
  | { readonly type: 'acceptPromotion' };

export type GameActionType = GameAction['type'];
export type ActionOf<T extends GameActionType> = Extract<GameAction, { type: T }>;

export interface ActionHandler<A extends GameAction> {
  /** Why the action can't be done right now, or null if it can. Must be side-effect free. */
  check(state: GameState, action: A, ctx: GameContext): string | null;
  /** Performs a checked action. May assume `check` returned null. */
  perform(state: GameState, action: A, ctx: GameContext, rng: Rng): GameState;
}
