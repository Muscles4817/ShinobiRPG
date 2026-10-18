/**
 * Experimenting at the stove: put some of the pantry together and see what comes of it. The
 * ingredients you choose (each once) are compared with recipes you don't know yet; the same set
 * as one of them teaches it, and otherwise the pot tells you how close you came.
 */

/**
 * A recipe as the pot sees it: what goes in, slot by slot. Each slot is the ingredients that
 * will do for it, one for most, every fish of a kind for a slot that takes any.
 */
export interface Dish {
  readonly id: string;
  readonly slots: readonly (readonly string[])[];
}

export const MAX_EXPERIMENT_INGREDIENTS = 4;
export const MIN_EXPERIMENT_INGREDIENTS = 2;

export type ExperimentResult =
  | { readonly kind: 'found'; readonly recipeId: string }
  /** Everything chosen belongs in some dish, which wants more. */
  | { readonly kind: 'close' }
  /** Some of it belongs together, some doesn't. */
  | { readonly kind: 'warm' }
  | { readonly kind: 'nothing' };

/** Whether each chosen ingredient fills a slot of its own, every slot filled once. */
function fillsEvery(chosen: readonly string[], slots: Dish['slots']): boolean {
  if (chosen.length !== slots.length) return false;
  const [first, ...rest] = chosen;
  if (first === undefined) return true;
  return slots.some(
    (slot, k) =>
      slot.includes(first) &&
      fillsEvery(
        rest,
        slots.filter((_, j) => j !== k),
      ),
  );
}

/** How many of the chosen ingredients belong somewhere in the dish. */
function overlap(chosen: readonly string[], dish: Dish): number {
  return chosen.filter((id) => dish.slots.some((slot) => slot.includes(id))).length;
}

export function tryCombination(
  chosen: readonly string[],
  unknown: readonly Dish[],
): ExperimentResult {
  const picked = [...new Set(chosen)];
  const found = unknown.find((d) => fillsEvery(picked, d.slots));
  if (found) return { kind: 'found', recipeId: found.id };
  if (unknown.some((d) => overlap(picked, d) === picked.length)) return { kind: 'close' };
  return unknown.some((d) => overlap(picked, d) >= MIN_EXPERIMENT_INGREDIENTS)
    ? { kind: 'warm' }
    : { kind: 'nothing' };
}
