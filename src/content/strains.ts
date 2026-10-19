import type { SwarmGift, SwarmQuality } from '@/systems/combat';
import type { Element } from '@/systems/techniques';

import type { Biome } from './biomes';

/**
 * Hives (`docs/design/retinue-plan.md`, step 4): the strains of insect a host can keep in their
 * body, and the clans that install a hive in their children. A strain has the qualities every
 * insect has, graded E to A (speed, bite, toughness, brood, size, senses), the gifts only its
 * species carries, weak to great (1 to 3: chakra drain, camouflage, glow, blinding, venom), and
 * the elements it can't stand. The fight reads them as a `SwarmStrain`.
 */

export const QUALITY_GRADES = ['E', 'D', 'C', 'B', 'A'] as const;
export type QualityGrade = (typeof QUALITY_GRADES)[number];

/** Insect families: how near two strains are when crossed. */
export const INSECT_FAMILIES = ['beetle', 'moth', 'wasp', 'spider', 'fly', 'locust'] as const;
export type InsectFamily = (typeof INSECT_FAMILIES)[number];

export interface StrainDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  /** The species, as a breeder says it ("kikaichū beetle"). */
  readonly species: string;
  readonly family: InsectFamily;
  readonly qualities: Readonly<Record<SwarmQuality, QualityGrade>>;
  readonly gifts: Readonly<Partial<Record<SwarmGift, 1 | 2 | 3>>>;
  /** Elements that kill it far faster. */
  readonly fears: readonly Element[];
  /** Where it lives wild, to be found and jarred (`seekInsects`); absent for a clan's own. */
  readonly wild?: InsectHaunt;
}

/** The wild country a strain is found in, and whether only by night. */
export interface InsectHaunt {
  readonly biomes: readonly Biome[];
  readonly night?: boolean;
}

/** A clan whose children are born with a hive. */
export interface ClanHive {
  readonly strainId: string;
}
