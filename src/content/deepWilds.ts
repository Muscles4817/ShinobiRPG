import type { WildDepth } from '@/systems/missions';

import type { Biome } from './biomes';

/**
 * Wild country you can go into off the paths (`docs/design/chakra-beasts-plan.md`), by the kind
 * of country it is: what walking each depth is like, finding the way deeper, and coming out.
 * What each depth holds is its road-event region's (`deepRegion`), as a road's is.
 */

/** A day at a depth: going in through it, and walking back out through it. */
export interface DepthDays {
  readonly going: string;
  readonly back: string;
}

/** Finding the way on to a deeper depth: the check, and how it went. */
export interface WayFinding {
  readonly text: string;
  readonly success: string;
  readonly failure: string;
}

export interface DeepWildsDef {
  readonly biome: Biome;
  /** What going in is called, mid-sentence: "the deep woods". */
  readonly name: string;
  readonly depths: Readonly<Record<WildDepth, DepthDays>>;
  readonly wayTo: Readonly<Record<Exclude<WildDepth, 'edge'>, WayFinding>>;
  /** Stepping back out to where you went in. */
  readonly out: string;
}

/** The road-event region of a depth of wild country: "woods-heart". */
export function deepRegion(biome: Biome, depth: WildDepth): string {
  return `${biome}-${depth}`;
}
