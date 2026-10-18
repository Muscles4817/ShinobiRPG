import type { Rank } from '@/systems/standing';
import type { Season } from '@/systems/time';

/**
 * Homes up the ladder, the furniture that makes one yours, and what a garden grows
 * (`docs/design/home-plan.md`). A home has spots for furniture and may have rooms that open
 * something (a garden, a yard to drill in, a guest room). Each piece
 * of furniture does one small thing, read at one hook while you are at home: a night's sleep, a
 * nap, study at your desk, a dinner with guests; decor only adds comfort.
 */

/** Where a piece of furniture can stand. */
export const SPOTS = ['bed', 'desk', 'wall', 'corner', 'hearth'] as const;
export type Spot = (typeof SPOTS)[number];

/** The spots of the home you start in (a rented room, or your room in the clan's house). */
export const FIRST_HOME_SPOTS: readonly Spot[] = ['bed', 'desk', 'wall', 'corner'];

/** Rooms that open something: a garden to grow in, a yard to drill in, a room for a guest. */
export const HOME_ROOMS = ['garden', 'yard', 'guest'] as const;
export type HomeRoom = (typeof HOME_ROOMS)[number];

export interface HomeDef {
  readonly id: string;
  readonly name: string;
  /** What you call it once you live there ("The flat on Lantern Row"). */
  readonly lodging: string;
  readonly blurb: string;
  /** The day you move in, in a line or two. */
  readonly movingIn: string;
  /** Rent a week, if it can be rented. */
  readonly rentPerWeek?: number;
  /** Bought outright, if it is for sale. */
  readonly price?: number;
  readonly needs?: { readonly rank?: Rank; readonly missionsCompleted?: number };
  readonly spots: readonly Spot[];
  readonly rooms: readonly HomeRoom[];
  /** Garden beds, with a garden. */
  readonly beds?: number;
  /** Drills done in the yard, with a yard (`TrainingDef` ids). */
  readonly yardTrainingIds?: readonly string[];
  /** Not playable yet: shown sealed with this reason, never moved into. */
  readonly lockedReason?: string;
}

/** What a piece of furniture does: read at one hook, while you are at home. */
export type FurnishingEffect =
  /** A night's sleep at home heals this much more. */
  | { readonly kind: 'sleep'; readonly by: number }
  /** A nap at home gives back this much more energy. */
  | { readonly kind: 'nap'; readonly energy: number }
  /** Scrolls studied at home go this much faster. */
  | { readonly kind: 'study'; readonly by: number }
  /** A dinner you host at home warms your guest this much more. */
  | { readonly kind: 'guests'; readonly bond: number }
  /** Only comfort. */
  | { readonly kind: 'decor' };

export interface FurnishingDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly spot: Spot;
  /** Sold at a joiner's for this; absent, it only comes as a gift or a reward. */
  readonly cost?: number;
  /** How much more it makes the place feel like home: 1 plain, 2 good, 3 fine. */
  readonly comfort: 1 | 2 | 3;
  readonly effect: FurnishingEffect;
  /** Every new character's home has one from the start. */
  readonly starter?: true;
}

/** Something a garden bed grows: an ingredient, after so many days, in these seasons. */
export interface GardenCrop {
  readonly ingredientId: string;
  readonly days: number;
  readonly seasons: readonly Season[];
  /** What the seed costs at the joiner's. */
  readonly seedCost: number;
}

/** The land office: homes up the ladder, and furniture and seed from the joiner next door. */
export interface LettingsFields {
  readonly kind: 'lettings';
  readonly keeper: string;
  readonly homeIds: readonly string[];
  readonly furnishingIds: readonly string[];
}
