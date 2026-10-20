import type { Find } from '@/systems/cooking';

/** The kinds of wild country a `wilds` place may be: what grows, swims and lives there. */
export type Biome = 'woods' | 'river' | 'shore' | 'mountain' | 'marsh' | 'desert';

/** Somewhere to cast a line: what bites there, and when. */
export interface FishingSpot {
  readonly id: string;
  readonly name: string;
  /** What it looks like, for the choice. No numbers. */
  readonly description: string;
  readonly catches: readonly Find[];
}

/** Woods, a river bank, a shore, the desert: forage what's in season, and fish its spots. */
export interface WildsFields {
  readonly kind: 'wilds';
  readonly biome: Biome;
  readonly finds: readonly Find[];
  readonly spots?: readonly FishingSpot[];
}
