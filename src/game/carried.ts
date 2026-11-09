import type { CarriedKit } from '@/content';
import type { CombatantSetup, CombatItem } from '@/systems/combat';

import type { GameContext } from './context';
import { arsenalGear } from './gear';

/**
 * What a fighter known by their kit carries into a fight (`CarriedKit`): the gear named, at the
 * mastery written for it, and a full pouch of the tools named, every fight. A person's arsenal
 * and a foe read it alike; without one they are armed as their techniques suggest.
 */

/** Tools by id and count as the fight carries them. */
export function pouchFrom(tools: Readonly<Record<string, number>>, ctx: GameContext): CombatItem[] {
  return Object.entries(tools).flatMap(([id, count]) => {
    const def = ctx.content.tools.get(id);
    return def && count > 0 ? [{ id, name: def.name, effect: def.effect, count }] : [];
  });
}

export function carriedInto(
  carries: CarriedKit | undefined,
  ctx: GameContext,
): Pick<CombatantSetup, 'gear' | 'items'> {
  const { gearIds, tools, weaponMastery } = carries ?? {};
  const mastery = weaponMastery ? { mastery: weaponMastery } : {};
  return {
    ...(gearIds ? { gear: { ...arsenalGear(gearIds, ctx), ...mastery } } : {}),
    ...(tools ? { items: pouchFrom(tools, ctx) } : {}),
  };
}
