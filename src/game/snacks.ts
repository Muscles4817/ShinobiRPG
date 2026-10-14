import { buffAt } from '@/systems/cooking';
import type { ModifierSpec } from '@/systems/modifiers';
import { SLOTS_PER_DAY, type GameTime } from '@/systems/time';

import type { GameContext } from './context';
import type { Character, Snack } from './state';

/**
 * Snacks: tea and sweets beside the day's meal. A snack's buff works through the stretch of
 * the day after you eat it, then wears off; a new snack replaces it, and it never touches the
 * meal.
 */

/** Slots a snack keeps working after the one it was eaten in. */
export const SNACK_SLOTS = 1;

export function slotIndex(time: GameTime): number {
  return (time.day - 1) * SLOTS_PER_DAY + time.slot;
}

/** The snack you eat now. */
export function snackFrom(recipeId: string, quality: Snack['quality'], now: GameTime): Snack {
  return { recipeId, quality, untilSlot: slotIndex(now) + SNACK_SLOTS };
}

/** The snack still working at this time, or none. */
export function snackAt(snack: Snack | undefined, time: GameTime): Snack | undefined {
  return snack && slotIndex(time) <= snack.untilSlot ? snack : undefined;
}

/** A working snack's buff, for `characterModifiers`. */
export function snackBuff(character: Character, ctx: GameContext): ModifierSpec {
  const recipe = character.snack ? ctx.content.recipes.get(character.snack.recipeId) : undefined;
  return recipe && character.snack ? buffAt(recipe.buff, character.snack.quality) : {};
}
