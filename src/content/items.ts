import type { ModifierSpec } from '@/systems/modifiers';
import type { StatDelta } from '@/systems/stats';

import type { IconId } from './art';

/** Content schemas for things you can own: gear to equip, ingredients and the recipes they make. */

export const GEAR_SLOTS = ['weapon', 'body', 'charm'] as const;
export type GearSlot = (typeof GEAR_SLOTS)[number];

export interface GearDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly slot: GearSlot;
  readonly cost: number;
  readonly icon: IconId;
  /** Added to your stats in fights while equipped. */
  readonly statBonuses: StatDelta;
}

export interface IngredientDef {
  readonly id: string;
  readonly name: string;
  readonly cost: number;
  readonly icon: IconId;
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
  readonly ingredients: readonly IngredientCount[];
  readonly satiety: number;
  readonly energy: number;
  /** "Well fed": lasts until the end of the day you eat it. Shown via `describeSpec`. */
  readonly buff: ModifierSpec;
}
