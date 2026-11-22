import type { GameContext } from '../context';
import { atHomeVillage } from '../homeVillage';
import { busyReason } from '../busy';
import { inTownWith } from '../people/cast';
import type { GameState } from '../state';
import type { Need } from './types';

/**
 * Whether a happening's needs hold. The only place they are asked: a happening never tests where
 * you are itself, so two happenings can't disagree about it.
 */

export const FREE: Need = { kind: 'free' };
export const AT_HOME: Need = { kind: 'atHome' };
export const OFF_DUTY: Need = { kind: 'offDuty' };

export function offDuty(state: GameState): boolean {
  return state.mission === null && state.exams.run === null;
}

export function needHolds(state: GameState, ctx: GameContext, need: Need): boolean {
  switch (need.kind) {
    case 'free':
      return busyReason(state) === null;
    case 'atHome':
      return atHomeVillage(state, ctx);
    case 'offDuty':
      return offDuty(state);
    case 'with': {
      const person = need.person(state, ctx);
      return person !== undefined && inTownWith(state, ctx, person);
    }
  }
}

/** The kinds of the needs that don't hold, in the order they were declared. */
export function unmetNeeds(
  state: GameState,
  ctx: GameContext,
  needs: readonly Need[],
): Need['kind'][] {
  return needs.filter((need) => !needHolds(state, ctx, need)).map((need) => need.kind);
}
