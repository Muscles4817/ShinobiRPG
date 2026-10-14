import type { Stall } from '@/content';

/**
 * Travelling merchants: market stalls that come to the village every few days (`Stall.visits`)
 * with what their home sells, and are gone again by the next morning. Read from the calendar,
 * never the Rng.
 */

/** Whether a stall is set up on this day: always, for a stall that never travels. */
export function visitingOn(stall: Pick<Stall, 'visits'>, day: number): boolean {
  const { visits } = stall;
  return visits === undefined || (day - 1) % visits.every === visits.on;
}

/** Days until a travelling stall next sets up (0 today); null for one that never travels. */
export function daysUntilVisit(stall: Pick<Stall, 'visits'>, day: number): number | null {
  const { visits } = stall;
  if (!visits) return null;
  const today = (day - 1) % visits.every;
  return (visits.on - today + visits.every) % visits.every;
}
