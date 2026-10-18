import type { ContentPack } from './types';

/**
 * Checks the kitchen: recipes cook from ingredients the pack sells and actually fill you up,
 * something sold keeps on the road, starters are plain (rank E), and every recipe can be
 * learned somewhere (a starter, a cookbook, someone who teaches it, or a job's reward).
 */
export function validateRecipes(pack: ContentPack): string[] {
  const roadFood = pack.ingredients.some((i) => (i.road ?? 0) > 0);
  return [
    ...(roadFood ? [] : ['pack sells no food that keeps on the road']),
    ...(pack.recipes.some((r) => r.starter === true) ? [] : ['pack has no starter recipe']),
    ...recipeLines(pack),
    ...sourceReferenceProblems(pack),
    ...unlearnable(pack),
    ...pack.campFinds
      .filter((f) => !pack.ingredients.some((i) => i.id === f.ingredientId))
      .map((f) => `camp find "${f.ingredientId}" is not an ingredient`),
  ];
}

function recipeLines(pack: ContentPack): string[] {
  const known = new Set(pack.ingredients.map((i) => i.id));
  const families = new Set(pack.ingredients.map((i) => i.family));
  return pack.recipes.flatMap((r) => [
    ...r.ingredients.flatMap((i) => {
      if ('family' in i) {
        return families.has(i.family)
          ? []
          : [`recipe "${r.id}" takes ${i.family} fish, and none is`];
      }
      return known.has(i.id) ? [] : [`recipe "${r.id}" needs unknown ingredient "${i.id}"`];
    }),
    ...(r.ingredients.length === 0 || r.satiety <= 0
      ? [`recipe "${r.id}" needs ingredients and must feed you`]
      : []),
    ...(r.starter === true && r.rank !== 'E' ? [`starter recipe "${r.id}" must be rank E`] : []),
  ]);
}

/** Every place a recipe can be learned from, as [where, recipe id]. */
function recipeSources(pack: ContentPack): [string, string][] {
  return [
    ...pack.cookbooks.flatMap((c) =>
      c.recipeIds.map((id): [string, string] => [`cookbook "${c.id}"`, id]),
    ),
    ...pack.people.flatMap((p) =>
      (p.recipes ?? []).map((l): [string, string] => [`person "${p.id}"`, l.recipeId]),
    ),
    ...pack.missions.flatMap((m) =>
      m.reward.recipeId === undefined
        ? []
        : [[`mission "${m.id}"`, m.reward.recipeId] as [string, string]],
    ),
  ];
}

function sourceReferenceProblems(pack: ContentPack): string[] {
  const recipes = new Set(pack.recipes.map((r) => r.id));
  return recipeSources(pack)
    .filter(([, id]) => !recipes.has(id))
    .map(([where, id]) => `${where} teaches unknown recipe "${id}"`);
}

function unlearnable(pack: ContentPack): string[] {
  const taught = new Set(recipeSources(pack).map(([, id]) => id));
  return pack.recipes
    .filter((r) => r.starter !== true && !taught.has(r.id))
    .map((r) => `recipe "${r.id}" can’t be learned anywhere`);
}
