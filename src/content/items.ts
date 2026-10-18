import type {
  ArmourLevel,
  CombatProvision,
  CombatItemEffect,
  FocusTarget,
  GearRank,
  WeaponEffect,
  WeaponShape,
} from '@/systems/combat';
import type { CookingMethod, CookingSteps } from '@/systems/cooking';
import type { ModifierSpec } from '@/systems/modifiers';
import type { StatGrade } from '@/systems/stats';
import type { Season } from '@/systems/time';

import type { IconId } from './art';

/**
 * Content schemas for things you can own: gear to equip, tools to use up in fights, ingredients,
 * the recipes they make and the cookbooks that teach them.
 */

/** Where a piece is worn: a held weapon, a thrown one, armour, and a focus charm. */
export const GEAR_SLOTS = ['weapon', 'thrown', 'body', 'charm'] as const;
export type GearSlot = (typeof GEAR_SLOTS)[number];

interface GearBase {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly cost: number;
  readonly icon: IconId;
  /** D and C are on every shelf, B needs chūnin rank, A is never sold (validated). */
  readonly rank: GearRank;
  /** A named weapon: never sold, but earned, found or inherited (validated). */
  readonly unique?: boolean;
}

/**
 * Gear changes how you fight, never your stats (the rules are in `systems/combat/rules`): a
 * weapon shapes a card (a blade's cut, knuckles' blows, better kunai or senbon), armour
 * trades protection for speed by its level, and a focus sharpens one verb or art.
 */
export type GearDef =
  | (GearBase & {
      readonly kind: 'weapon';
      readonly shape: WeaponShape;
      /** A unique weapon's own verbs, added to every strike it lands. */
      readonly effects?: readonly WeaponEffect[];
    })
  | (GearBase & { readonly kind: 'armour'; readonly level: ArmourLevel })
  | (GearBase & { readonly kind: 'focus'; readonly boosts: FocusTarget });

export type GearKind = GearDef['kind'];

/** The slot a piece goes in: held or thrown for weapons by their shape. */
export function gearSlot(def: GearDef): GearSlot {
  switch (def.kind) {
    case 'weapon':
      return def.shape === 'blade' || def.shape === 'knuckles' ? 'weapon' : 'thrown';
    case 'armour':
      return 'body';
    case 'focus':
      return 'charm';
  }
}

/** A fight tool: bought by the piece, carried in your pouch, spent in a fight. */
export interface ToolDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly cost: number;
  readonly icon: IconId;
  /** What it does in a fight; the rules are the same in every fight style. */
  readonly effect: CombatItemEffect;
}

export interface IngredientDef {
  readonly id: string;
  readonly name: string;
  readonly cost: number;
  readonly icon: IconId;
  /** Only at the grocer in these seasons; absent means all year. */
  readonly seasons?: readonly Season[];
  /** Keeps on the road: a day's meal there, filling you this much. */
  readonly road?: number;
  /** A fish's length in centimetres, shortest to longest: what the field book measures. */
  readonly length?: readonly [number, number];
}

export interface IngredientCount {
  readonly id: string;
  readonly count: number;
}

export interface RecipeDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: IconId;
  /** E–S like a technique: a cook can manage one rank above their grade, never two. */
  readonly rank: StatGrade;
  /** Everyone knows it from the start (validated: rank E). */
  readonly starter?: boolean;
  /**
   * A snack (tea, a sweet) sits beside the day's meal: its buff lasts only through the next
   * stretch of the day, and a new snack replaces it. Absent: a meal.
   */
  readonly kind?: 'snack';
  /** How it's cooked: the method sets the right cut, heat and finish at the stove. */
  readonly method: CookingMethod;
  /** Where this dish goes against its method (a gentle fry for a rolled omelette). */
  readonly steps?: Partial<CookingSteps>;
  readonly ingredients: readonly IngredientCount[];
  readonly satiety: number;
  readonly energy: number;
  /** Health it gives back as you eat it (a broth, not a hospital). */
  readonly health?: number;
  /** Chakra it gives back as you eat it (rare, chakra-rich food). */
  readonly chakra?: number;
  /** "Well fed": lasts until the end of the day you eat it. Shown via `describeSpec`. */
  readonly buff: ModifierSpec;
  /** What it brings into the day's fights when cooked well (good or fine). */
  readonly provision?: CombatProvision;
}

/** A cookbook: bought once at a stall, it teaches every recipe in it. */
export interface CookbookDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly cost: number;
  readonly icon: IconId;
  readonly recipeIds: readonly string[];
}

/** A recipe someone will teach you once you are close enough (a bond stage). */
export interface RecipeLesson {
  readonly recipeId: string;
  readonly minStage: number;
}
