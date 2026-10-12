import type { ContentPack } from './types';

/**
 * Gear: shops sell D to B (B needs chūnin rank), A-rank and unique pieces are never sold, only
 * unique weapons carry their own verbs, and what is sold has a price.
 */
export function validateGear(pack: ContentPack): string[] {
  const sold = new Set(
    pack.locations.flatMap((l) => l.places.flatMap((p) => (p.kind === 'gear' ? p.gearIds : []))),
  );
  return pack.gear.flatMap((g) => {
    const unique = g.unique === true;
    const verbs = g.kind === 'weapon' && (g.effects ?? []).length > 0;
    return [
      unique && sold.has(g.id) && `unique gear "${g.id}" is sold at a shop`,
      !unique && g.rank === 'A' && `gear "${g.id}" is rank A but not unique`,
      !unique && verbs && `gear "${g.id}" has its own verbs but is not unique`,
      !unique && g.cost <= 0 && `gear "${g.id}" is sold for nothing`,
    ].filter((p): p is string => typeof p === 'string');
  });
}
