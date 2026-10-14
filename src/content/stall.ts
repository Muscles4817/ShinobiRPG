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
  /** Cookbooks for sale: each teaches its recipes. */
  readonly cookbookIds?: readonly string[];
  readonly hours?: OpeningHours;
  /** A travelling merchant: sets up only on its days (see `StallVisits`). Absent: always here. */
  readonly visits?: StallVisits;
}

/** A visiting stall comes every `every` days, on the days where (day − 1) mod `every` is `on`. */
export interface StallVisits {
  readonly every: number;
  readonly on: number;
}
