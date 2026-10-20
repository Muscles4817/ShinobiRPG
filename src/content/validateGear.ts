import { MAX_BLADES, SHAPE_OF_CLASS } from '@/systems/combat';

import type { GearDef } from './items';
import type { ContentPack } from './types';

/** Several blades in hand are blades, two to `MAX_BLADES` of them. */
function bladesProblem(g: GearDef): string | null {
  if (g.kind !== 'weapon' || g.blades === undefined) return null;
  const fits = Number.isInteger(g.blades) && g.blades >= 2 && g.blades <= MAX_BLADES;
  if (!fits) return `gear "${g.id}" has ${g.blades} blades; a flurry is 2 to ${MAX_BLADES}`;
  return SHAPE_OF_CLASS[g.weaponClass] === 'blade'
    ? null
    : `gear "${g.id}" has blades but isn't a blade`;
}

/**
 * Gear: shops sell D to B (B needs chūnin rank), A-rank and unique pieces are never sold, only
 * unique weapons carry their own verbs, what is sold has a price, and blades in hand are sane.
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
      bladesProblem(g),
    ].filter((p): p is string => typeof p === 'string');
  });
}
