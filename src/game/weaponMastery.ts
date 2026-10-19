import { clamp } from '@/core';
import {
  HELD_SHAPES,
  shapeOf,
  type CombatGear,
  type WeaponClass,
  type WeaponMastery,
} from '@/systems/combat';
import type { Stats } from '@/systems/stats';

import type { Character } from './state';

/**
 * How well you know each class of weapon (`rules/mastery.ts` reads it in a fight): the weapon
 * art is kenjutsu, and mastery is how much of it a weapon lets through. Everyone leaves the
 * academy at home with kunai and shuriken and a little practised with a tantō; a student who
 * worked at the sword knows it too. After that, mastery comes from use: drills that work the
 * weapon in hand or the thrown one, and every fight it is carried into. Each gain closes part
 * of the gap to mastery, so the first sessions count most. Saves from before mastery have none
 * kept, and their owners stay at home with every weapon.
 */

/** What every graduate knows: kunai and shuriken drilled for years, a tantō for a few. */
const ACADEMY_MASTERY: WeaponMastery = { throwing: 0.4, 'light-blade': 0.2 };
/** A student whose kenjutsu is this far along has worked at blades as well. */
const BLADE_STUDENT = 8;
const BLADE_STUDENT_MASTERY: WeaponMastery = { 'light-blade': 0.45, sword: 0.35 };
/** A drill that works a weapon closes this share of the gap to mastery. */
export const DRILL_MASTERY = 0.04;
/** A fight a weapon is carried into closes this share. */
export const FIGHT_MASTERY = 0.03;

/** Mastery of each class on graduation day. */
export function graduationMastery(stats: Stats): WeaponMastery {
  return stats.kenjutsu >= BLADE_STUDENT
    ? { ...ACADEMY_MASTERY, ...BLADE_STUDENT_MASTERY }
    : ACADEMY_MASTERY;
}

/** Mastery with one class practised by a share of what is left to learn. */
export function practised(
  mastery: WeaponMastery,
  weaponClass: WeaponClass,
  share: number,
): WeaponMastery {
  const now = mastery[weaponClass] ?? 0;
  const next = clamp(now + (1 - now) * share, 0, 1);
  return { ...mastery, [weaponClass]: Math.round(next * 1000) / 1000 };
}

/** The class a hand works: the weapon held (none: nothing), or the thrown one (plain kunai). */
export function classInHand(gear: CombatGear, hand: 'held' | 'thrown'): WeaponClass | null {
  if (hand === 'thrown') return gear.thrown?.weaponClass ?? 'throwing';
  const held = gear.held;
  return held && HELD_SHAPES.includes(shapeOf(held)) ? held.weaponClass : null;
}

/** A character after working a hand's weapon; unchanged for a save that keeps no mastery. */
export function workedWeapon(
  character: Character,
  gear: CombatGear,
  { hand, share }: { readonly hand: 'held' | 'thrown'; readonly share: number },
): Character {
  const mastery = character.weaponMastery;
  const weaponClass = classInHand(gear, hand);
  if (!mastery || !weaponClass) return character;
  return { ...character, weaponMastery: practised(mastery, weaponClass, share) };
}

/** A character after a fight: both hands' weapons carried in are a little better known. */
export function foughtWith(character: Character, gear: CombatGear): Character {
  const held = workedWeapon(character, gear, { hand: 'held', share: FIGHT_MASTERY });
  return workedWeapon(held, gear, { hand: 'thrown', share: FIGHT_MASTERY });
}

const MASTERY_WORDS: readonly { readonly from: number; readonly word: string }[] = [
  { from: 0.75, word: 'masterful' },
  { from: 0.4, word: 'seasoned' },
  { from: 0.15, word: 'practised' },
  { from: 0, word: 'never held one' },
];

/** How well a class is known, in words: never held one, practised, seasoned, masterful. */
export function masteryWord(mastery: number): string {
  return MASTERY_WORDS.find((w) => mastery >= w.from)?.word ?? 'never held one';
}
