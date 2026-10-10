import type { RangeBand } from '../../contract';
import { targetable } from '../../rules/body';
import { attackKindOf, canAttackFrom, hasTrait, homeBand, isPhysical } from '../../rules/kit';
import type { AttackAction } from './actions';
import { livingOn, type Fighter } from './state';

/**
 * Reach in the Classic style. There are no shared range bands, only who stands back: two
 * fighters are close when both are engaged, far when either is distant. Blows and blades need
 * close; jutsu, seals and an archer's shots reach either way. Kit traits decide where a fighter
 * can attack from at all (archers not up close, brawlers only up close).
 */

export const UNSEEN = "You can't see them. Search or Dispel.";

export function bandBetween(a: Fighter, b: Fighter): RangeBand {
  return a.distant || b.distant ? 'far' : 'close';
}

/** Blows and blades, unless an archer is behind them (their shots are ranged). */
export function isCloseRange(actor: Fighter, action: AttackAction): boolean {
  if (hasTrait(actor, 'archer')) return false;
  return isPhysical(attackKindOf(action.kind === 'technique' ? action.technique : null));
}

export function reaches(actor: Fighter, target: Fighter, action: AttackAction): boolean {
  const band = bandBetween(actor, target);
  return canAttackFrom(actor, band) && (band === 'close' || !isCloseRange(actor, action));
}

export function foesOf(fighters: readonly Fighter[], actor: Fighter): Fighter[] {
  return livingOn(fighters, actor.side === 'player' ? 'enemy' : 'player');
}

/** Living, visible foes this attack can land on. */
export function reachableFoes(
  fighters: readonly Fighter[],
  actor: Fighter,
  action: AttackAction,
): Fighter[] {
  return foesOf(fighters, actor).filter((f) => targetable(f) && reaches(actor, f, action));
}

/**
 * Where a fighter the player doesn't control wants to move before fighting: away when they
 * can't attack up close (archers), in when they can't attack from afar (brawlers).
 */
export function footworkWanted(f: Fighter): 'back-off' | 'close-in' | null {
  const here: RangeBand = f.distant ? 'far' : 'close';
  if (canAttackFrom(f, here)) return null;
  return homeBand(f) === 'close' ? 'close-in' : 'back-off';
}
