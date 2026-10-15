import type { GameState } from './state';

/**
 * The genin years: until you make chūnin, your sensei runs your life as a shinobi
 * (`docs/design/sensei-plan.md`). Every rule that changes while you are under a sensei asks
 * this one question, so the years end in one place.
 */
export function underSensei(state: Pick<GameState, 'standing' | 'people'>): boolean {
  return state.standing.rank === 'genin' && (state.people.team?.senseiId ?? null) !== null;
}
