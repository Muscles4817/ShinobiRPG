import { alive } from '../../rules/body';
import { gathered } from '../../rules/chakra';
import { rested } from './effort';
import type { PlanFighter, PlanState } from './state';

/**
 * Fights end (audit P0.5). Two sides that can barely hurt each other used to trade for ever,
 * chakra and breath coming back every exchange. Now a round in which everyone together lost
 * less than `QUIET_SHARE` of their health is a quiet one (`quietRounds`). After `TIRE_AFTER` of
 * them in a row both sides are tired for the rest of the fight: chakra and breath stop coming
 * back, so what each has left must win it. After `STALEMATE_AFTER` in a row both break off, and
 * the fight ends in a stalemate. A round that hurts starts the count again; tiredness stays.
 */

/** A round in which everyone together loses less than this share of their health is quiet. */
export const QUIET_SHARE = 0.05;
/** Quiet rounds in a row before both sides tire. */
export const TIRE_AFTER = 3;
/** Quiet rounds in a row before the fight is called a stalemate. */
export const STALEMATE_AFTER = 8;

export interface Quiet {
  /** Rounds in a row that ended with no one much worse off. */
  readonly quietRounds?: number;
  /** Everyone's health together as the round began, to tell how much the round hurt. */
  readonly roundHealth?: number;
  /** Both sides have tired: nothing comes back between exchanges any more. */
  readonly tired?: true;
}

function totalOf(fighters: readonly PlanFighter[], of: 'health' | 'maxHealth'): number {
  return fighters.reduce((sum, f) => sum + Math.max(0, f[of]), 0);
}

/** What a fighter gets back between exchanges: their chakra and breath, unless tired. */
export function recovered(f: PlanFighter, state: Quiet): Partial<PlanFighter> {
  if (!alive(f) || state.tired) return {};
  return { chakra: gathered(f), ...rested(f) };
}

/**
 * The round's end, counted: one more quiet round, or the count started again; tired once the
 * count reaches the line, and past the last one, a stalemate.
 */
export function quietAfter(
  state: PlanState,
): Pick<PlanState, 'quietRounds' | 'roundHealth' | 'tired' | 'result'> {
  const now = totalOf(state.fighters, 'health');
  const was = state.roundHealth;
  const calm = was !== undefined && was - now < totalOf(state.fighters, 'maxHealth') * QUIET_SHARE;
  const quiet = calm ? (state.quietRounds ?? 0) + 1 : 0;
  const tired = state.tired ?? (quiet >= TIRE_AFTER ? true : undefined);
  const result = state.result ?? (quiet >= STALEMATE_AFTER ? 'stalemate' : null);
  return { quietRounds: quiet, roundHealth: now, ...(tired ? { tired } : {}), result };
}
