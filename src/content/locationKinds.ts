import type { StatDelta } from '@/systems/stats';

/**
 * What kind of place a location is (`docs/design/journeys-plan.md` 3.2). The kind decides what
 * it must have (`validateLocationKinds.ts`) and how the map marks it: a hidden village, a big
 * civilian city, a small town, a stretch of wild country, or a landmark worth the walk.
 */
export const LOCATION_KINDS = ['village', 'city', 'town', 'wild', 'landmark'] as const;
export type LocationKind = (typeof LOCATION_KINDS)[number];

/** Kinds where you sleep under the sky, at a `camp` place, not in an inn. */
export const CAMPING_KINDS: readonly LocationKind[] = ['wild', 'landmark'];

/**
 * What a landmark is there to be seen for, when the road passes it and you stop: what you see,
 * and a little of what it teaches you.
 */
export interface LandmarkSight {
  readonly text: string;
  readonly reward: StatDelta;
}
