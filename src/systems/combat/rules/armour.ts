import { clamp } from '@/core';

import type { CombatAttributes } from '../contract';
import type { ArmourLevel, CombatArmour, CombatGear } from '../gearContract';
import { rankStep } from './gearRank';
import type { HitType } from './hits';

/**
 * What armour does, in every fight style: it meets each kind of hurt its own way (`hits.ts`)
 * and trades that for speed, which is also footwork and the dodge. A light flak vest takes the
 * sting out of small thrown steel and a little off blows; a reinforced jacket stops most thrown
 * weapons and dulls blows and cuts; heavier shinobi armour more; full samurai plate turns blades
 * almost entirely, points well and blows less, and carries a lightning strike in. Illusions go
 * through all of it, and the elements nearly so. Strength carries the weight: the stronger the
 * wearer, the less it slows them. A better rank protects a little more for the same weight.
 */

interface LevelRule {
  /** Share of each kind of hurt that still gets through; a kind not named gets through whole. */
  readonly kept: Readonly<Partial<Record<HitType, number>>>;
  /** Share of speed it costs a wearer with no strength to carry it. */
  readonly slows: number;
}

/** What a shinobi jacket does against the elements: a little, and nothing against lightning. */
const JACKET_ELEMENTS = { chakra: 0.97, fire: 0.95, wind: 0.95, earth: 0.95, water: 0.97 };

const LEVEL_RULES: Readonly<Record<ArmourLevel, LevelRule>> = {
  light: { kept: { blunt: 0.93, cut: 0.95, pierce: 0.8 }, slows: 0 },
  flak: { kept: { blunt: 0.85, cut: 0.82, pierce: 0.72, ...JACKET_ELEMENTS }, slows: 0.1 },
  heavy: { kept: { blunt: 0.78, cut: 0.66, pierce: 0.66, ...JACKET_ELEMENTS }, slows: 0.25 },
  plate: {
    kept: { blunt: 0.78, cut: 0.42, pierce: 0.55, ...JACKET_ELEMENTS, lightning: 1.1 },
    slows: 0.4,
  },
};

/** Each rank above D lets this much less through of what the armour protects against. */
const KEPT_PER_RANK = 0.03;
/** Strength at which a wearer carries any armour as if it weighed nothing (grade S). */
export const STRENGTH_CARRIES = 40;

/** Share of a hit of this kind that gets through this armour. */
export function armourKept(armour: Pick<CombatArmour, 'level' | 'rank'>, hit: HitType): number {
  const kept = LEVEL_RULES[armour.level].kept[hit] ?? 1;
  return kept < 1 ? kept - KEPT_PER_RANK * rankStep(armour.rank) : kept;
}

/** Share of speed the armour costs this wearer, after their strength carries some of it. */
export function armourSlows(armour: Pick<CombatArmour, 'level'>, strength: number): number {
  const carried = clamp(strength / STRENGTH_CARRIES, 0, 1);
  return LEVEL_RULES[armour.level].slows * (1 - carried);
}

/** The share of a hit of this kind the fighter's armour lets through: 1 without any. */
export function wornArmourKept(f: { readonly gear?: CombatGear }, hit: HitType): number {
  const armour = f.gear?.armour;
  return armour ? armourKept(armour, hit) : 1;
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
