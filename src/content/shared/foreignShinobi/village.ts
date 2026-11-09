import type { Element } from '@/systems/techniques';

/**
 * Another hidden village, as its shinobi meet you on a job: what they are called in a fight,
 * the headband they wear, the natures that run in the village and the names its missing-nin go
 * by. A village need not be a place on the map yet; its shinobi travel.
 */
export interface ShinobiVillage {
  readonly id: string;
  /** The word their shinobi go by in a fight: "Dune" for a Dune Chūnin Sensor. */
  readonly short: string;
  /** One sentence on how you know one: "A sand-coloured headband…". No numbers. */
  readonly headband: string;
  /** The natures the village's shinobi have, the commonest first. */
  readonly natures: readonly [Element, ...Element[]];
  /** Grown-up names its missing-nin are known by, one for each rogue (validated by count). */
  readonly rogueNames: readonly string[];
}

/** A pack's techniques for a nature, plain to masterly: a shot, something heavier, a jōnin's. */
export interface NatureArts {
  readonly shot: string;
  readonly heavy: string;
  readonly master: string;
}

/** A pack's nature techniques, for every element its villages' shinobi may have. */
export type NatureKit = Readonly<Record<Element, NatureArts>>;
