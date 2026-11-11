import type { RangeBand } from '../../contract';
import { alive } from '../../rules/body';
import { RANGE_BANDS } from '../../rules/range';
import { screened } from '../../rules/rows';
import { distanceBetween, facing, type PairMove } from './distance';
import type { PlanFighter, Round } from './state';

/**
 * Which pairs a fighter's own movement changes (`docs/design/range-per-foe-plan.md`). Going in,
 * only the foe they go for comes nearer, and through the front row to a back-row foe it guards,
 * the front row with it. Drawing back, they get clear of every foe nearer than where they go.
 * Everyone else keeps their distance.
 */

function nearer(band: RangeBand, than: RangeBand): boolean {
  return RANGE_BANDS.indexOf(band) < RANGE_BANDS.indexOf(than);
}

/** The foe gone for, and the front row in their way. */
function closingIn(round: Round, actor: PlanFighter, foe: PlanFighter, to: RangeBand): PairMove[] {
  const inTheWay = screened(foe, round.fighters)
    ? round.fighters.filter(
        (f) =>
          f.side === foe.side &&
          f.row === 'front' &&
          alive(f) &&
          nearer(to, distanceBetween(round, actor.id, f.id)),
      )
    : [];
  return [foe, ...inTheWay].map((f) => ({ a: actor.id, b: f.id, to }));
}

/** Every foe nearer than where the fighter draws back to. */
function drawingBack(round: Round, actor: PlanFighter, to: RangeBand): PairMove[] {
  return round.fighters
    .filter(
      (f) =>
        f.side !== actor.side && alive(f) && nearer(distanceBetween(round, actor.id, f.id), to),
    )
    .map((f) => ({ a: actor.id, b: f.id, to }));
}

/** The pairs that change as `actor` goes to `to` from `target` (else the foe they face). */
export function movesFor(
  round: Round,
  actor: PlanFighter,
  target: PlanFighter | undefined,
  to: RangeBand,
): PairMove[] {
  const foe = target ?? facing(round, actor);
  if (!foe) return [];
  return nearer(to, distanceBetween(round, actor.id, foe.id))
    ? closingIn(round, actor, foe, to)
    : drawingBack(round, actor, to);
}
