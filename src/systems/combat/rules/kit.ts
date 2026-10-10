import type { CombatTechnique, CombatTrait, RangeBand } from '../contract';
import { preferredRange, RANGE_BANDS } from './range';

/**
 * What a fighter's traits mean in any fight style: where they can attack from, where they
 * want to be, what hurts them, and how they behave. Engines ask these questions instead of
 * reading traits themselves, so an archer is an archer everywhere.
 */

/** What kind of attack lands, which decides what armour and spirits shrug off. */
export type AttackKind = 'blow' | 'weapon' | 'jutsu' | 'seal';

const ARMOUR_SCALE = 0.6;
const SPIRIT_PHYSICAL_SCALE = 0.35;
const SPIRIT_SEAL_SCALE = 1.3;
/** Extra damage per other living packmate. */
const PACK_BONUS = 0.15;
/** A coward runs once their health falls below this fraction. */
const COWARD_FLEES_AT = 0.3;
/** Extra chance a swift fighter slips a blow, in engines that roll to dodge or avoid. */
export const SWIFT_DODGE = 0.2;

interface Kitted {
  readonly traits: readonly CombatTrait[];
}

export function hasTrait(f: Kitted, trait: CombatTrait): boolean {
  return f.traits.includes(trait);
}

/** Blows and blades are physical; ninjutsu and genjutsu are chakra; fūinjutsu is sealing. */
export function attackKindOf(technique: CombatTechnique | null, thrown = false): AttackKind {
  if (!technique) return thrown ? 'weapon' : 'blow';
  switch (technique.discipline) {
    case 'taijutsu':
      return 'blow';
    case 'kenjutsu':
      return 'weapon';
    case 'ninjutsu':
    case 'genjutsu':
      return 'jutsu';
    case 'fuuinjutsu':
      return 'seal';
  }
}

export function isPhysical(kind: AttackKind): boolean {
  return kind === 'blow' || kind === 'weapon';
}

/** How much of an attack of this kind actually hurts the defender. */
export function kitDamageScale(defender: Kitted, kind: AttackKind): number {
  let scale = 1;
  if (hasTrait(defender, 'armoured') && isPhysical(kind)) scale *= ARMOUR_SCALE;
  if (hasTrait(defender, 'spirit')) {
    if (isPhysical(kind)) scale *= SPIRIT_PHYSICAL_SCALE;
    if (kind === 'seal') scale *= SPIRIT_SEAL_SCALE;
  }
  return scale;
}

/** Archers can't fight up close; brawlers can only fight up close. Everyone else anywhere. */
export function canAttackFrom(f: Kitted, band: RangeBand): boolean {
  if (hasTrait(f, 'archer')) return band !== 'close';
  if (hasTrait(f, 'brawler')) return band === 'close';
  return true;
}

/** Where a fighter wants to be: their trait decides, else wherever their offence reaches. */
export function homeBand(
  f: Kitted & { readonly techniques: readonly CombatTechnique[] },
): RangeBand {
  if (hasTrait(f, 'archer')) return 'far';
  if (hasTrait(f, 'brawler')) return 'close';
  return preferredRange(f);
}

/** The bands a fighter can attack from, for describing them. */
export function attackBands(f: Kitted): RangeBand[] {
  return RANGE_BANDS.filter((band) => canAttackFrom(f, band));
}

/** Packs fight better together: extra damage for each other living member of the pack. */
export function packScale(
  f: Kitted & { readonly side: string; readonly id: string },
  fighters: readonly (Kitted & {
    readonly side: string;
    readonly id: string;
    readonly health: number;
  })[],
): number {
  if (!hasTrait(f, 'pack')) return 1;
  const mates = fighters.filter(
    (o) => o.id !== f.id && o.side === f.side && o.health > 0 && hasTrait(o, 'pack'),
  ).length;
  return 1 + mates * PACK_BONUS;
}

/** Cowards run once badly hurt; the engine removes them from the fight as beaten. */
export function shouldFlee(
  f: Kitted & { readonly health: number; readonly maxHealth: number },
): boolean {
  return hasTrait(f, 'coward') && f.health > 0 && f.health < f.maxHealth * COWARD_FLEES_AT;
}
