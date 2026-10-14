/**
 * Experimenting at the stove: put some of the pantry together and see what comes of it. The
 * ingredients you choose (each once) are compared with recipes you don't know yet; the same set
 * as one of them teaches it, and otherwise the pot tells you how close you came.
 */

/** A recipe as the pot sees it: the set of what goes in. */
export interface Dish {
  readonly id: string;
  readonly ingredientIds: readonly string[];
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

function sameSet(a: readonly string[], b: ReadonlySet<string>): boolean {
  return a.length === b.size && a.every((id) => b.has(id));
}

export function tryCombination(
  chosen: readonly string[],
  unknown: readonly Dish[],
): ExperimentResult {
  const picked = new Set(chosen);
  const found = unknown.find((d) => sameSet([...new Set(d.ingredientIds)], picked));
  if (found) return { kind: 'found', recipeId: found.id };
  const overlap = (d: Dish) => [...picked].filter((id) => d.ingredientIds.includes(id)).length;
  if (unknown.some((d) => overlap(d) === picked.size)) return { kind: 'close' };
  return unknown.some((d) => overlap(d) >= MIN_EXPERIMENT_INGREDIENTS)
    ? { kind: 'warm' }
    : { kind: 'nothing' };
}
