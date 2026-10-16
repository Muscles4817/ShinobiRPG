import type { Discipline } from '@/systems/techniques';

import type { CombatAttributes, CombatTechnique, RangeBand } from '../contract';
import type { CombatGear } from '../gearContract';

/**
 * Kenjutsu (`docs/design/hittability-plan.md`, Part 3). A blade in skilled hands is a big
 * advantage, and it costs something:
 *  - Reach wins the first moment up close: a fighter with a blade drawn acts first there
 *    (`reachLead`), unless a foe's taijutsu is well clear of their kenjutsu; blade against
 *    blade, the better kenjutsu goes first.
 *  - A swing is a commitment: a cut is countered as readily as the wielder's kenjutsu falls
 *    short (`cutSkill`, read by `counterChance`).
 *  - Hand signs need both hands: with a blade drawn, ninjutsu, genjutsu and fūinjutsu at close
 *    and mid arrive slower and are read more easily (`handsFull`); at far there is time to
 *    sheathe. Kenjutsu techniques that run chakra through the blade pay nothing.
 * How hard a cut hits is the blade's shape rule (`weapons.ts`).
 */

/** Initiative a drawn blade buys up close: more than chance, less than a real gap in speed. */
export const REACH_LEAD = 4;
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
  if (f.gear !== undefined) return f.gear.held?.shape === 'blade';
  return f.techniques.some((t) => t.needs?.weapon === 'blade');
}

/** The skill behind a hand-to-hand answer: taijutsu, or kenjutsu with a blade in hand. */
function closeSkill(f: Armed): number {
  const { taijutsu, kenjutsu } = f.attributes;
  return bladeInHand(f) ? Math.max(taijutsu, kenjutsu) : taijutsu;
}

/**
 * The initiative a fighter's blade buys them up close against these foes: none away from close,
 * without a blade, against a foe whose hands are well clear of it, or against a better blade.
 */
export function reachLead(f: Armed, foes: readonly Armed[], band: RangeBand): number {
  if (band !== 'close' || !bladeInHand(f)) return 0;
  const { kenjutsu } = f.attributes;
  const outmatched = foes.some(
    (foe) =>
      foe.attributes.taijutsu >= kenjutsu * CLEAR_OF_REACH ||
      (bladeInHand(foe) && foe.attributes.kenjutsu > kenjutsu),
  );
  return outmatched ? 0 : REACH_LEAD;
}

/** The skill a cut is countered against: the wielder's kenjutsu, not their fists. */
export function cutSkill(attacker: Armed): number {
  return attacker.attributes.kenjutsu;
}

/** The skill a counter is thrown with: hands, or a blade where it is the better. */
export function counterSkill(defender: Armed): number {
  return closeSkill(defender);
}

/** A technique cast with hands full: a signed art, a blade drawn, short of far. */
export function handsFull(caster: Armed, discipline: Discipline, band: RangeBand): boolean {
  return band !== 'far' && SIGNED_ARTS.includes(discipline) && bladeInHand(caster);
}
