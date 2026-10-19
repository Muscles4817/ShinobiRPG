import type { CombatAttributes } from '../contract';
import type { CombatGear, WeaponClass } from '../gearContract';

/**
 * Weapon mastery, in every fight style. The weapon art (kenjutsu) is what any weapon fighter
 * has: timing, footwork, a feel for steel. Mastery is how much of it a given kind of weapon lets
 * through: a stranger to a weapon still fights with half their art, a master with all of it.
 * So a monster with shuriken can be outclassed in a sword fight, and a great swordsman is only
 * ordinary with a kunai.
 */

/** With a weapon never held before, this share of the art comes through. */
export const MASTERY_FLOOR = 0.5;

interface Armed {
  readonly attributes: CombatAttributes;
  readonly gear?: CombatGear;
}

/** The share of the weapon art a class lets through, for this fighter. */
export function masteryShare(f: Armed, weaponClass: WeaponClass): number {
  const mastery = f.gear?.mastery;
  // Fighters whose gear isn't known are armed as their techniques suggest, and at home with it.
  if (mastery === undefined) return 1;
  const known = Math.min(1, Math.max(0, mastery[weaponClass] ?? 0));
  return MASTERY_FLOOR + (1 - MASTERY_FLOOR) * known;
}

/** The weapon art a fighter brings to a weapon of this class. */
export function weaponArt(f: Armed, weaponClass: WeaponClass): number {
  return f.attributes.kenjutsu * masteryShare(f, weaponClass);
}
