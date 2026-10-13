import { type Season, SEASONS } from '@/systems/time';

import type { ContentPack } from './types';
import type { Stall } from './stall';

/**
 * Seasonal food hangs together: a dish or ingredient that comes and goes names real seasons,
 * and no stall stands empty for a whole season because everything it sells is out of season.
 */
export function validateSeasons(pack: ContentPack): string[] {
  const goods = [
    ...pack.foods.map((f) => ({ label: `food "${f.id}"`, seasons: f.seasons })),
    ...pack.ingredients.map((i) => ({ label: `ingredient "${i.id}"`, seasons: i.seasons })),
  ];
  return [
    ...goods
      .filter(({ seasons }) => seasons !== undefined && !sensibleSeasons(seasons))
      .map(({ label }) => `${label} must name each of its seasons once, and not all four`),
    ...marketStalls(pack).flatMap((stall) => emptySeasons(pack, stall)),
  ];
}

/** Some seasons, each once, but not every one (that is simply "all year"). */
function sensibleSeasons(seasons: readonly Season[]): boolean {
  const distinct = new Set(seasons).size;
  return distinct === seasons.length && distinct > 0 && distinct < SEASONS.length;
}

function marketStalls(pack: ContentPack): readonly Stall[] {
  return pack.locations.flatMap((l) =>
    l.places.flatMap((p) => (p.kind === 'market' ? p.stalls : [])),
  );
}

interface Seasonal {
  readonly id: string;
  readonly seasons?: readonly Season[];
}

function emptySeasons(pack: ContentPack, stall: Stall): string[] {
  const find = (list: readonly Seasonal[], ids: readonly string[]) =>
    list.filter((item) => ids.includes(item.id));
  // Unknown ids are validateWorld's to report; here only what the stall really sells counts.
  const wares = [
    ...find(pack.foods, stall.foodIds),
    ...find(pack.ingredients, stall.ingredientIds ?? []),
  ];
  if (wares.length === 0) return [];
  return SEASONS.filter(
    (season) => !wares.some((w) => w.seasons === undefined || w.seasons.includes(season)),
  ).map((season) => `stall "${stall.name}" has nothing to sell in ${season}`);
}
