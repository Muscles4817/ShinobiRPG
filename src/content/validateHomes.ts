import { FIRST_HOME_SPOTS, SPOTS } from './homes';
import type { ContentPack } from './types';

/**
 * Homes, furniture and the garden fit together: a home's yard has drills that exist, its garden
 * has beds, each spot is a real spot once; every crop is a real ingredient; and every spot a
 * piece of furniture stands in is one some home has.
 */
export function validateHomes(pack: ContentPack): string[] {
  const training = new Set(pack.training.map((t) => t.id));
  const ingredients = new Set(pack.ingredients.map((i) => i.id));
  const homeProblems = pack.homes.flatMap((home) => [
    ...(home.rooms.includes('yard') && !(home.yardTrainingIds?.length ?? 0)
      ? [`home "${home.id}" has a yard with no drills`]
      : []),
    ...(home.yardTrainingIds ?? [])
      .filter((id) => !training.has(id))
      .map((id) => `home "${home.id}" yard names unknown drill "${id}"`),
    ...(home.rooms.includes('garden') && !((home.beds ?? 0) > 0)
      ? [`home "${home.id}" has a garden with no beds`]
      : []),
    ...(new Set(home.spots).size !== home.spots.length
      ? [`home "${home.id}" names a spot twice`]
      : []),
    ...(home.lockedReason === undefined &&
    home.rentPerWeek === undefined &&
    home.price === undefined
      ? [`home "${home.id}" can be neither rented nor bought`]
      : []),
  ]);
  const spots = new Set([...FIRST_HOME_SPOTS, ...pack.homes.flatMap((h) => h.spots)]);
  const furnitureProblems = pack.furnishings
    .filter((f) => !spots.has(f.spot) || !SPOTS.includes(f.spot))
    .map((f) => `furnishing "${f.id}" stands in a spot no home has`);
  const cropProblems = pack.gardenCrops
    .filter((c) => !ingredients.has(c.ingredientId))
    .map((c) => `garden crop "${c.ingredientId}" is not an ingredient`);
  return [...homeProblems, ...furnitureProblems, ...cropProblems];
}
