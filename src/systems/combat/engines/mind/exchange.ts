import type { RangeBand } from '../../contract';
import { inReach } from '../../rules/range';
import { reachOfMove } from './moves';
import type { Move } from './state';

/**
 * The heart of the mind game: what one fighter's committed move does to an opponent who
 * committed to another. Pure and symmetric — `clash(a, b)` and `clash(b, a)` describe the
 * same exchange from each side.
 */

/** How a move lands on the opponent. `scale` multiplies the move's normal damage. */
export type Landing =
  | { readonly kind: 'none' }
  | { readonly kind: 'whiff' }
  | { readonly kind: 'blocked' }
  | { readonly kind: 'hit'; readonly scale: number; readonly interrupts: boolean }
  | { readonly kind: 'opens'; readonly scale: number }
  | { readonly kind: 'countered' };

const NONE: Landing = { kind: 'none' };
const FEINT_SCALE = 0.5;
const COUNTER_SCALE = 1.5;
const GUARDED_JUTSU = 0.5;

function isAttack(move: Move): boolean {
  return move.kind === 'strike' || move.kind === 'throw';
}

function reaches(move: Move, range: RangeBand): boolean {
  return inReach(reachOfMove(move), range);
}

/** Does `defender`'s move stop an incoming attack outright? */
function counteredBy(defender: Move, range: RangeBand): boolean {
  return defender.kind === 'counter' && range === 'close';
}

function attackLanding(defender: Move, range: RangeBand): Landing {
  if (defender.kind === 'guard') return { kind: 'blocked' };
  if (counteredBy(defender, range)) return { kind: 'countered' };
  return { kind: 'hit', scale: 1, interrupts: defender.kind === 'jutsu' };
}

/** Whether `move`, a jutsu, gets cut off by the opponent's move before it goes off. */
export function interrupted(move: Move, opponent: Move, range: RangeBand): boolean {
  if (move.kind !== 'jutsu') return false;
  if (isAttack(opponent) && reaches(opponent, range)) return true;
  return opponent.kind === 'counter' && range === 'close';
}

function jutsuLanding(mover: Move, defender: Move, range: RangeBand): Landing {
  if (interrupted(mover, defender, range)) return { kind: 'blocked' };
  const scale = defender.kind === 'guard' ? GUARDED_JUTSU : 1;
  return { kind: 'hit', scale, interrupts: false };
}

function counterLanding(counter: Move, defender: Move, range: RangeBand): Landing {
  if (isAttack(defender) && range === 'close') {
    return { kind: 'hit', scale: COUNTER_SCALE, interrupts: false };
  }
  return interrupted(defender, counter, range) ? { kind: 'hit', scale: 1, interrupts: true } : NONE;
}

/** What `mover`'s move does to an opponent who chose `defender`, at `range`. */
export function clash(mover: Move, defender: Move, range: RangeBand): Landing {
  if (!reaches(mover, range)) return mover.kind === 'guard' ? NONE : { kind: 'whiff' };
  switch (mover.kind) {
    case 'strike':
    case 'throw':
      return attackLanding(defender, range);
    case 'feint':
      return defender.kind === 'guard' || defender.kind === 'counter'
        ? { kind: 'opens', scale: FEINT_SCALE }
        : NONE;
    case 'counter':
      return counterLanding(mover, defender, range);
    case 'jutsu':
      return jutsuLanding(mover, defender, range);
    case 'guard':
    case 'step-in':
    case 'step-back':
    case 'idle':
      return NONE;
  }
}

/** Net movement this round: steps in and back cancel out; the range moves at most one band. */
export function netStep(moves: readonly Move[]): -1 | 0 | 1 {
  const total = moves.reduce(
    (sum, m) => sum + (m.kind === 'step-in' ? -1 : m.kind === 'step-back' ? 1 : 0),
    0,
  );
  return total < 0 ? -1 : total > 0 ? 1 : 0;
}
