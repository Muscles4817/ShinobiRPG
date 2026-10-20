import type { Rng } from '@/core';
import type { MapStyle } from '../mapStyle';
import type { DayEndMode } from '../daybook/state';
import type { Contest, RaceMove, Stakes } from '../rival/state';
import type { RangeBand } from '@/systems/combat';
import type { PlayKind } from '@/systems/companions';
import type { CookingSteps } from '@/systems/cooking';
import type { HiveShare } from '@/systems/hives';
import type { ApproachId, ReconId } from '@/systems/missions';
import type { DrinkWayId } from '../bar';
import type { DiceCall } from '../state';
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
  /** `yard`: in your own yard at home, not the training ground. */
  | { readonly type: 'train'; readonly trainingId: string; readonly yard?: boolean }
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
  | { readonly type: 'setDayEnd'; readonly mode: DayEndMode }
  | { readonly type: 'dismissDay' }
  | { readonly type: 'answerRival'; readonly choiceIndex: number }
  | { readonly type: 'acceptChallenge' }
  | { readonly type: 'declineChallenge' }
  | { readonly type: 'challengeRival'; readonly contest: Contest; readonly stakes: Stakes }
  | { readonly type: 'runRaceLeg'; readonly move: RaceMove }
  | { readonly type: 'moveHome'; readonly homeId: string; readonly buy: boolean }
  | { readonly type: 'buyFurnishing'; readonly furnishingId: string }
  | { readonly type: 'placeFurnishing'; readonly furnishingId: string }
  | { readonly type: 'plantBed'; readonly bed: number; readonly ingredientId: string }
  | { readonly type: 'pickBed'; readonly bed: number }
  | { readonly type: 'inviteGuest'; readonly personId: string }
  | { readonly type: 'sendGuestHome' }
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
  | { readonly type: 'befriendStray' }
  | { readonly type: 'trackWild'; readonly placeId: string }
  | { readonly type: 'takePup' }
  | { readonly type: 'takeRescued' }
  | { readonly type: 'rehomeCompanion' }
  | { readonly type: 'handlerSession'; readonly stat: StatId }
  | { readonly type: 'handlerTeach'; readonly techniqueId: string }
  | { readonly type: 'buyLore'; readonly loreId: string }
  | { readonly type: 'signContract'; readonly personId: string }
  | { readonly type: 'makeOffering'; readonly ingredientId: string }
  | { readonly type: 'breakContract' }
  | { readonly type: 'seekInsects'; readonly placeId: string }
  | { readonly type: 'studyJar'; readonly strainId: string }
  | { readonly type: 'crossJar'; readonly strainId: string }
  | { readonly type: 'nameStrain'; readonly name: string }
  | { readonly type: 'readRite'; readonly placeId: string }
  | { readonly type: 'learnRite'; readonly personId: string }
  | { readonly type: 'takeHive'; readonly clanId: string; readonly share: HiveShare }
  | { readonly type: 'feedCompanion'; readonly ingredientId: string | null }
  | { readonly type: 'playWithCompanion'; readonly play: PlayKind }
  | { readonly type: 'doseCompanion'; readonly hidden: boolean }
  | { readonly type: 'trainCompanion'; readonly stat: StatId }
  | { readonly type: 'treatCompanion' }
  | { readonly type: 'buyMedicine' }
  | { readonly type: 'hostDinner'; readonly recipeId: string; readonly guestId: string }
  | { readonly type: 'buyRound' }
  | {
      readonly type: 'playDice';
      readonly pastimeId: string;
      readonly call: DiceCall;
      readonly stake: number;
    }
  | { readonly type: 'drinkWith'; readonly personId: string; readonly way: DrinkWayId }
  | { readonly type: 'soak'; readonly withId: string | null }
  | { readonly type: 'enterExam'; readonly replacements?: readonly Replacement[] }
  | { readonly type: 'examAnswer'; readonly approach: MindApproach }
  | { readonly type: 'examFinal'; readonly stay: boolean }
  | { readonly type: 'examContinue' }
  | { readonly type: 'watchFinals' }
  | { readonly type: 'acceptPromotion' };

export type GameActionType = GameAction['type'];
export type ActionOf<T extends GameActionType> = Extract<GameAction, { type: T }>;

export interface ActionHandler<A extends GameAction> {
  /** Why the action can't be done right now, or null if it can. Must be side-effect free. */
  check(state: GameState, action: A, ctx: GameContext): string | null;
  /** Performs a checked action. May assume `check` returned null. */
  perform(state: GameState, action: A, ctx: GameContext, rng: Rng): GameState;
}
