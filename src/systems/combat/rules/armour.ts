import { clamp } from '@/core';

import type { CombatAttributes } from '../contract';
import type { ArmourLevel, CombatArmour, CombatGear } from '../gearContract';
import { rankStep } from './gearRank';

/**
 * What armour does, in every fight style: the `armoured` kit rule (`kit.ts`), scaled by level.
 * Each level trades protection against blows and blades for speed, which is also footwork and
 * the dodge: light armour costs nothing, a flak jacket a little, heavier shinobi armour more,
 * full samurai plate a lot. Strength carries the weight: the stronger the wearer, the less it
 * slows them. A better rank protects a little more for the same weight.
 */

interface LevelRule {
  /** Share of a blow or blade that still gets through. */
  readonly kept: number;
  /** Share of speed it costs a wearer with no strength to carry it. */
  readonly slows: number;
}

const LEVEL_RULES: Readonly<Record<ArmourLevel, LevelRule>> = {
  light: { kept: 0.93, slows: 0 },
  flak: { kept: 0.86, slows: 0.1 },
  heavy: { kept: 0.77, slows: 0.25 },
  plate: { kept: 0.66, slows: 0.4 },
};

/** Each rank above D lets this much less through. */
const KEPT_PER_RANK = 0.03;
/** Strength at which a wearer carries any armour as if it weighed nothing (grade S). */
export const STRENGTH_CARRIES = 40;

/** Share of a physical hit that gets through this armour. */
export function armourKept(armour: Pick<CombatArmour, 'level' | 'rank'>): number {
  return LEVEL_RULES[armour.level].kept - KEPT_PER_RANK * rankStep(armour.rank);
}

/** Share of speed the armour costs this wearer, after their strength carries some of it. */
export function armourSlows(armour: Pick<CombatArmour, 'level'>, strength: number): number {
  const carried = clamp(strength / STRENGTH_CARRIES, 0, 1);
  return LEVEL_RULES[armour.level].slows * (1 - carried);
}

/** The share of a blow or blade the fighter's armour lets through: 1 without any. */
export function wornArmourKept(f: { readonly gear?: CombatGear }): number {
  const armour = f.gear?.armour;
  return armour ? armourKept(armour) : 1;
}

/** A fighter's stats as they move in their armour: slower, the heavier it is. */
export function armouredAttributes(
  attributes: CombatAttributes,
  gear: CombatGear | undefined,
): CombatAttributes {
  const armour = gear?.armour;
  if (!armour) return attributes;
  const slows = armourSlows(armour, attributes.strength);
  return slows > 0 ? { ...attributes, speed: attributes.speed * (1 - slows) } : attributes;
}
