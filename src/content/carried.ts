import type { WeaponMastery } from '@/systems/combat';

/**
 * What a fighter carries into every fight, for someone known by their kit: the gear they wear,
 * the tools in their pouch and how well they know each weapon. A person's arsenal and a foe both
 * name it, and both are armed as their techniques suggest without it.
 */
export interface CarriedKit {
  /** The pack's gear they fight in, a piece per slot (validated). Left out, armed as their kit. */
  readonly gearIds?: readonly string[];
  /** The pack's fight tools they carry into every fight, by id, and how many. */
  readonly tools?: Readonly<Record<string, number>>;
  /**
   * How well they know each class of weapon, 0 to 1 (`rules/mastery.ts`), read with their gear.
   * Left out, they are at home with whatever they carry.
   */
  readonly weaponMastery?: WeaponMastery;
}
