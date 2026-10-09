import {
  createDefaultContext,
  createNewGame,
  dispatch,
  type GameAction,
  type GameContext,
  type GameState,
} from '@/game';

export const ctx: GameContext = createDefaultContext();

export function newGame(overrides: Partial<GameState> = {}, context: GameContext = ctx): GameState {
  return {
    ...createNewGame({ name: 'Kaito', aptitudeId: 'taijutsu', seed: 1234 }, context),
    ...overrides,
  };
}

/** Dispatches an action, failing the test if it is refused. */
export function act(state: GameState, action: GameAction, context: GameContext = ctx): GameState {
  const result = dispatch(state, action, context);
  if (!result.ok) throw new Error(`Action ${action.type} refused: ${result.error}`);
  return result.value;
}

/** A character with every stat set to `value`. */
export function withAllStats(state: GameState, value: number): GameState {
  const stats = Object.fromEntries(Object.keys(state.character.stats).map((k) => [k, value]));
  return {
    ...state,
    character: { ...state.character, stats: stats as GameState['character']['stats'] },
  };
}

export function lastJournal(state: GameState): string {
  return state.journal.entries.at(-1)?.text ?? '';
}
