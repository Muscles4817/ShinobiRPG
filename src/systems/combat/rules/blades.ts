import type { Discipline } from '@/systems/techniques';

import type { CombatAttributes, CombatTechnique, RangeBand } from '../contract';
import { shapeOf, type CombatGear, type CombatWeapon, type WeaponShape } from '../gearContract';
import { weaponArt } from './mastery';
import { speedOf, weaponGuard } from './weapons';

/**
 * Kenjutsu (`docs/design/hittability-plan.md`, Part 3). A blade in skilled hands is a big
 * advantage, and it costs something:
 *  - Reach wins the first moment up close: a fighter with a weapon drawn acts first there
 *    (`reachLead`, more with a quick weapon), unless a foe's taijutsu is well clear of their
 *    weapon art; weapon against weapon, the better art goes first.
 *  - A swing is a commitment: a cut is countered as readily as the wielder's weapon art falls
 *    short (`cutSkill`, read by `counterChance`).
 *  - Hand signs need both hands: with a weapon drawn, ninjutsu, genjutsu and fūinjutsu at close
 *    and mid arrive slower and are read more easily (`handsFull`); at far there is time to
 *    sheathe. Kenjutsu techniques that run chakra through the blade pay nothing.
 * The weapon art is kenjutsu at the weapon's mastery (`mastery.ts`); how hard a cut hits and
 * how a class handles is `weapons.ts`.
 */

/** Initiative a drawn blade buys up close: more than chance, less than a real gap in speed. */
export const REACH_LEAD = 4;
/** Initiative more (or less) for each step of the weapon's speed: Mifune's draw. */
export const LEAD_PER_SPEED = 1.5;
/** Shapes fought with the weapon art in hand. */
const WEAPON_ART_SHAPES: readonly WeaponShape[] = ['blade', 'blunt'];
/** A foe whose taijutsu is this much more than the wielder's kenjutsu takes the reach away. */
const CLEAR_OF_REACH = 1.3;
/** Arts cast with hand signs, which a drawn blade gets in the way of. */
const SIGNED_ARTS: readonly Discipline[] = ['ninjutsu', 'genjutsu', 'fuuinjutsu'];
/** With hands full, a signed technique arrives this much as fast… */
export const HANDS_FULL_ARRIVAL = 0.85;
/** …and is read this much more easily. */
export const HANDS_FULL_READ = 1.25;

interface Armed {
  readonly attributes: CombatAttributes;
  readonly gear?: CombatGear;
  readonly techniques: readonly CombatTechnique[];
}

/**
 * A blade in hand: the one equipped, or, for a fighter whose gear isn't known (foes and
 * teammates are armed as their techniques suggest), any blade art they know.
 */
export function bladeInHand(f: Armed): boolean {
  if (f.gear !== undefined) return f.gear.held !== undefined && shapeOf(f.gear.held) === 'blade';
  return f.techniques.some((t) => t.needs?.weapon === 'blade');
}

/** The weapon of the weapon art in hand (a blade, a staff, a club), when the gear is known. */
function armedWith(f: Armed): CombatWeapon | null {
  const held = f.gear?.held;
  return held && WEAPON_ART_SHAPES.includes(shapeOf(held)) ? held : null;
}

/** A weapon of the weapon art in hand: a blade, or a blunt weapon. */
export function weaponInHand(f: Armed): boolean {
  return armedWith(f) !== null || bladeInHand(f);
}

/** The weapon art a fighter brings to what they hold: kenjutsu at its mastery. */
export function heldArt(f: Armed): number {
  const held = armedWith(f);
  return held ? weaponArt(f, held.weaponClass) : f.attributes.kenjutsu;
}

/** The share more a fighter's weapon guards with: a heavy blade or a staff turns more. */
export function heldGuard(f: Armed): number {
  const held = armedWith(f);
  return held ? weaponGuard(held) : 0;
}

/** The skill behind a hand-to-hand answer: taijutsu, or the weapon art with a weapon in hand. */
function closeSkill(f: Armed): number {
  const { taijutsu } = f.attributes;
  return weaponInHand(f) ? Math.max(taijutsu, heldArt(f)) : taijutsu;
}

/**
 * The initiative a fighter's weapon buys them up close against these foes: none away from
 * close, without one, against a foe whose hands are well clear of it, or against a better
 * weapon. A quick weapon buys more, a slow one less.
 */
export function reachLead(f: Armed, foes: readonly Armed[], band: RangeBand): number {
  if (band !== 'close' || !weaponInHand(f)) return 0;
  const art = heldArt(f);
  const outmatched = foes.some(
    (foe) =>
      foe.attributes.taijutsu >= art * CLEAR_OF_REACH || (weaponInHand(foe) && heldArt(foe) > art),
  );
  const held = armedWith(f);
  const quick = held ? speedOf(held) * LEAD_PER_SPEED : 0;
  return outmatched ? 0 : Math.max(0, REACH_LEAD + quick);
}

/** The skill a cut is countered against: the wielder's weapon art, not their fists. */
export function cutSkill(attacker: Armed): number {
  return heldArt(attacker);
}

/** The skill a counter is thrown with: hands, or a weapon where it is the better. */
export function counterSkill(defender: Armed): number {
  return closeSkill(defender);
}

/** A technique cast with hands full: a signed art, a weapon drawn, short of far. */
export function handsFull(caster: Armed, discipline: Discipline, band: RangeBand): boolean {
  return band !== 'far' && SIGNED_ARTS.includes(discipline) && weaponInHand(caster);
}
