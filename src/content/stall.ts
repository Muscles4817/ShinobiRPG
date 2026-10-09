import type { TimeSlot } from '@/systems/time';

import type { IconId } from './art';

/** Market stalls and opening hours, shared by places and festivals. */

/** When a place or stall is open. Absent means always. */
export type OpeningHours = readonly TimeSlot[];

export interface Stall {
  readonly name: string;
  readonly blurb: string;
  readonly icon: IconId;
  readonly foodIds: readonly string[];
  /** Raw ingredients to cook at home (a grocer). */
  readonly ingredientIds?: readonly string[];
  readonly hours?: OpeningHours;
}
