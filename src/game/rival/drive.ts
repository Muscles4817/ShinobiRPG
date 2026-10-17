import { fightingPower, type StatDelta, type Stats } from '@/systems/stats';

import type { GameState } from '../state';

/**
 * A rival who has fallen behind you trains harder: more drills a day, for as long as you stay
 * ahead. Peers otherwise grow on their own by the same rules as everyone; this is the one
 * open exception (`docs/design/rival-plan.md`), and the Rivalry tab says so in words.
 */

export const TRAILING_DRIVE = 1.25;

/** Whether this person is your rival and behind you overall. */
export function trailsYou(state: GameState, personId: string, theirs: Stats): boolean {
  return (
    state.rival?.personId === personId &&
    fightingPower(state.character.stats) > fightingPower(theirs)
  );
}

/** A day's drills, harder when they are a rival behind you. */
export function driven(
  state: GameState,
  personId: string,
  theirs: Stats,
  gains: StatDelta,
): StatDelta {
  if (!trailsYou(state, personId, theirs)) return gains;
  return Object.fromEntries(
    Object.entries(gains).map(([id, weight]) => [id, weight * TRAILING_DRIVE]),
  );
}
