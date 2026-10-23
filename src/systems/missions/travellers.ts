import type { RoadRarity } from './roadEvents';
import type { DecisionOption } from './storyStages';

/**
 * People of the road (`docs/design/journeys-plan.md` 3.6): a peddler, a pilgrim, a ronin, a troupe
 * of players. Each walks some regions and is met there, now and then, as a road event, meeting by
 * meeting in order. They remember you: what an option leaves (`remember`) is what a later meeting
 * may need, so the second meeting knows how the first went, and a meeting may end with a gift.
 */

/** What a traveller may leave you with: a recipe taught, something from their pack, or word of a place. */
export type TravellerGift =
  | { readonly kind: 'recipe'; readonly recipeId: string }
  | { readonly kind: 'ingredient'; readonly ingredientId: string }
  /** The nearest place on the roads you haven't heard of. */
  | { readonly kind: 'place' };

export interface TravellerOption extends DecisionOption {
  /** What the traveller keeps of how this went, for later meetings' `needs`. */
  readonly remember?: string;
  readonly gift?: TravellerGift;
}

export interface TravellerMeeting {
  readonly text: string;
  /** Met only if the traveller remembers this of an earlier meeting; passed over otherwise. */
  readonly needs?: string;
  readonly options: readonly TravellerOption[];
}

export interface TravellerDef {
  readonly id: string;
  /** How they look to someone who has never met them, as the road event that brings them. */
  readonly seen: string;
  /** The roads they walk. */
  readonly regions: readonly string[];
  /** Uncommon when absent. */
  readonly rarity?: RoadRarity;
  /** In the order they come; once every meeting is behind you, they are met no more. */
  readonly meetings: readonly TravellerMeeting[];
}

/** The road event a traveller comes as, so the road draws them like anything else on it. */
export function travellerEventId(travellerId: string): string {
  return `traveller-${travellerId}`;
}
