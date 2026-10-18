import type { PlanFighter } from './state';

/**
 * Dazes in a planned fight: a daze costs its target their next turn and leaves them open (no
 * dodge, a finisher target) through the exchange after; then they are steady for a while, so
 * dazes can't be chained.
 */

/** Dazed: about to lose a turn, or still reeling from one. */
export function isDazed(f: Pick<PlanFighter, 'stunned' | 'openUntil'>): boolean {
  return f.stunned > 0 || f.openUntil !== undefined;
}

/** Exchanges a fighter stays steady (no fresh daze takes hold) after a daze wears off. */
export const STEADY_EXCHANGES = 1;

/**
 * Whether a daze can take hold of this fighter in exchange `exchange`: not while dazed, nor
 * while steady after one. Rounds play out on their own, so a chain of dazes would leave the
 * player watching themselves lose.
 */
export function canDaze(
  f: Pick<PlanFighter, 'stunned' | 'openUntil' | 'steadyUntil'>,
  exchange: number,
): boolean {
  return !isDazed(f) && (f.steadyUntil === undefined || f.steadyUntil < exchange);
}

/**
 * A fresh daze, dealt in exchange `exchange` by the fighter `by` (an id): it costs one turn,
 * and leaves its target open through the next exchange. Check `canDaze` first. Who dealt it is
 * kept for the fight's summary only.
 */
export function dazeIn(
  exchange: number,
  by: string,
): Pick<PlanFighter, 'stunned' | 'openUntil' | 'dazedBy'> {
  return { stunned: 1, openUntil: exchange + 1, dazedBy: { at: exchange, by } };
}

/** At the end of an exchange: a daze whose last open exchange this was wears off. */
export function wearOffDaze(f: PlanFighter, exchange: number): PlanFighter {
  if (f.openUntil === undefined || f.openUntil > exchange) return f;
  const { openUntil: _done, ...rest } = f;
  return { ...rest, steadyUntil: exchange + STEADY_EXCHANGES };
}
