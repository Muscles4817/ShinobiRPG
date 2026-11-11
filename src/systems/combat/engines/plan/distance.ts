import type { RangeBand } from '../../contract';
import { alive } from '../../rules/body';
import { RANGE_BANDS } from '../../rules/range';
import type { Distances, PlanFighter } from './state';

/**
 * How far apart two fighters on opposite sides stand (`docs/design/range-per-foe-plan.md`).
 * Every pair of foes keeps a distance of its own, kept in `distances` by `pairKey`; a pair with
 * none stands at the fight's distance (`range`), which is also where everyone starts. Ask a pair
 * with `distanceBetween`, and a fighter's own distance (the foe they face) with `bandOf`; never
 * read `range` for one fighter's sake.
 */

/** What a distance is read from: the fight's distance, and each pair's where it differs. */
export interface Spacing {
  readonly range: RangeBand;
  readonly distances?: Distances;
}

/** One key for a pair, whichever way round they are named. */
export function pairKey(a: string, b: string): string {
  return a < b ? `${a}|${b}` : `${b}|${a}`;
}

/** How far apart two fighters stand. */
export function distanceBetween(spacing: Spacing, a: string, b: string): RangeBand {
  return spacing.distances?.[pairKey(a, b)] ?? spacing.range;
}

/**
 * A fighter's distance: to the nearest foe still standing, the one they face. Their plan plays
 * from it, their footwork moves from it, and the screen says it of them. With no foe left
 * standing, the fight's distance.
 */
export function bandOf(
  spacing: Spacing & { readonly fighters: readonly PlanFighter[] },
  fighter: Pick<PlanFighter, 'id' | 'side'>,
): RangeBand {
  const foes = spacing.fighters.filter((f) => f.side !== fighter.side && alive(f));
  const bands = foes.map((foe) =>
    RANGE_BANDS.indexOf(distanceBetween(spacing, fighter.id, foe.id)),
  );
  return bands.length === 0 ? spacing.range : (RANGE_BANDS[Math.min(...bands)] ?? spacing.range);
}

/** Whether everyone stands where they stood: the fight's distance and every pair's. */
export function sameSpacing(before: Spacing, after: Spacing): boolean {
  return before.range === after.range && before.distances === after.distances;
}

/** The pairs' own distances, to carry from a round to the fight's state (none when none). */
export function spacingOf(spacing: Spacing): Pick<Spacing, 'distances'> {
  return spacing.distances ? { distances: spacing.distances } : {};
}
