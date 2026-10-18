/**
 * A hive kept in the body (`docs/design/retinue-plan.md`, step 4): installed at birth, or later,
 * it takes a share of its host's chakra for good (a little, half, most), and that share sets how
 * many insects the body can keep. Insects lost in a fight breed back each day, quickly at home,
 * slowly away, and slower still when the host goes hungry.
 */

export const HIVE_SHARES = ['little', 'half', 'most'] as const;
export type HiveShare = (typeof HIVE_SHARES)[number];

/** The share of the host's chakra each choice gives the hive for good. */
export const SHARE_OF_CHAKRA: Readonly<Record<HiveShare, number>> = {
  little: 0.25,
  half: 0.5,
  most: 0.7,
};
/** Insects the body keeps for each point of chakra given to the hive. */
export const INSECTS_PER_CHAKRA = 2;
/** Share of the cap bred back in a day at home, and away from it. */
export const BREED_AT_HOME = 0.35;
export const BREED_AWAY = 0.1;
/** A hungry host breeds this much as fast. */
export const HUNGRY_BREEDING = 0.5;

export interface Hive {
  /** The strain the hive holds (`StrainDef`). */
  readonly strainId: string;
  readonly share: HiveShare;
  /** Insects in it now. */
  readonly count: number;
}

/** The chakra a host keeps for themselves, out of what their body would hold without a hive. */
export function chakraKept(fullChakra: number, share: HiveShare): number {
  return Math.round(fullChakra * (1 - SHARE_OF_CHAKRA[share]));
}

/** As many insects as the body can keep, from the chakra the host would hold without a hive. */
export function hiveCap(fullChakra: number, share: HiveShare): number {
  return Math.round(fullChakra * SHARE_OF_CHAKRA[share] * INSECTS_PER_CHAKRA);
}

/** What a day does to a hive. */
export interface BreedingDay {
  readonly atHome: boolean;
  readonly hungry: boolean;
}

/** The hive after a day of breeding, never past its cap. */
export function bredFor(hive: Hive, cap: number, day: BreedingDay): Hive {
  const rate = (day.atHome ? BREED_AT_HOME : BREED_AWAY) * (day.hungry ? HUNGRY_BREEDING : 1);
  const count = Math.min(cap, hive.count + Math.max(1, Math.round(cap * rate)));
  return count === hive.count ? hive : { ...hive, count };
}

/** The hive after a fight, with the insects that came home. */
export function afterFight(hive: Hive, cameHome: number, cap: number): Hive {
  return { ...hive, count: Math.max(0, Math.min(cap, Math.round(cameHome))) };
}
