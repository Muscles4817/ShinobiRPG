import type {
  FishFamily,
  IngredientCount,
  IngredientDef,
  RecipeDef,
  RecipeIngredient,
} from '@/content';

import type { GameContext } from './context';

/**
 * What a recipe takes from the pantry. Most of a recipe names its ingredients; a fish slot may
 * name a family instead (`FamilyCount`), and any fish of it will do: the cook's own choice
 * first (the fish put in the pot), then the cheapest they have, so a rare catch isn't spent on
 * an everyday dish by accident.
 */

type Pantry = Readonly<Record<string, number>>;

export interface PantryTake {
  /** Ingredients and counts to use up. */
  readonly taken: readonly IngredientCount[];
  /** The fish that filled the recipe's family slots, by name, for the dish's heading. */
  readonly fish: readonly string[];
}

const FAMILY_WORDS: Readonly<Record<FishFamily, string>> = {
  white: 'Any white fish',
  oily: 'Any oily fish',
  freshwater: 'Any freshwater fish',
  shellfish: 'Any shellfish',
};

function isFamily(i: RecipeIngredient): i is Extract<RecipeIngredient, { family: FishFamily }> {
  return 'family' in i;
}

/** Every fish of a family the pack knows, cheapest first. */
export function familyMembers(ctx: GameContext, family: FishFamily): readonly IngredientDef[] {
  return ctx.content.ingredients.all
    .filter((i) => i.family === family)
    .sort((a, b) => a.cost - b.cost || a.id.localeCompare(b.id));
}

/** The ids a slot accepts: the one ingredient it names, or every fish of its family. */
export function slotIds(ctx: GameContext, slot: RecipeIngredient): readonly string[] {
  return isFamily(slot) ? familyMembers(ctx, slot.family).map((i) => i.id) : [slot.id];
}

/** How the slot is written on a card: the ingredient's name, or "Any white fish". */
export function slotName(ctx: GameContext, slot: RecipeIngredient): string {
  return isFamily(slot)
    ? FAMILY_WORDS[slot.family]
    : (ctx.content.ingredients.get(slot.id)?.name ?? slot.id);
}

/** How much of what the slot accepts is in the pantry. */
export function slotHave(ctx: GameContext, pantry: Pantry, slot: RecipeIngredient): number {
  return slotIds(ctx, slot).reduce((sum, id) => sum + (pantry[id] ?? 0), 0);
}

/** A family's fish in the order the cook reaches for them: chosen first, then cheapest. */
function reachOrder(ids: readonly string[], prefer: readonly string[]): readonly string[] {
  return [...ids.filter((id) => prefer.includes(id)), ...ids.filter((id) => !prefer.includes(id))];
}

/** Takes `need` of the given ids from what's left, in order, or null if there isn't enough. */
function takeFrom(left: Pantry, ids: readonly string[], need: number) {
  const taken: IngredientCount[] = [];
  let still = need;
  for (const id of ids) {
    const n = Math.min(still, left[id] ?? 0);
    if (n > 0) taken.push({ id, count: n });
    still -= n;
  }
  if (still > 0) return null;
  const after = { ...left };
  taken.forEach((t) => (after[t.id] = (after[t.id] ?? 0) - t.count));
  return { taken, after };
}

/**
 * What `servings` of a recipe take from the pantry, or null when it can't cover them. Named
 * ingredients are set aside first, so a family slot never eats the fish another slot names.
 */
export function takeFor(
  ctx: GameContext,
  pantry: Pantry,
  recipe: RecipeDef,
  options: { readonly servings: number; readonly prefer?: readonly string[] },
): PantryTake | null {
  const slots = [
    ...recipe.ingredients.filter((i) => !isFamily(i)),
    ...recipe.ingredients.filter(isFamily),
  ];
  let left = pantry;
  const taken: IngredientCount[] = [];
  const fish: string[] = [];
  for (const slot of slots) {
    const ids = reachOrder(slotIds(ctx, slot), options.prefer ?? []);
    const part = takeFrom(left, ids, slot.count * options.servings);
    if (!part) return null;
    left = part.after;
    taken.push(...part.taken);
    if (isFamily(slot)) fish.push(...part.taken.map((p) => ingredientName(ctx, p.id)));
  }
  return { taken, fish };
}

function ingredientName(ctx: GameContext, id: string): string {
  return ctx.content.ingredients.require(id).name;
}

/** The slots the pantry can't cover for `servings`, by name. */
export function shortFor(
  ctx: GameContext,
  pantry: Pantry,
  recipe: RecipeDef,
  servings: number,
): string[] {
  return recipe.ingredients
    .filter((slot) => slotHave(ctx, pantry, slot) < slot.count * servings)
    .map((slot) => slotName(ctx, slot));
}

/** A dish's heading name: the recipe, and the fish it was cooked with where it takes any. */
export function dishName(recipe: RecipeDef, fish: readonly string[]): string {
  const named = [...new Set(fish)];
  return named.length > 0 ? `${recipe.name} with ${named.join(' and ')}` : recipe.name;
}
