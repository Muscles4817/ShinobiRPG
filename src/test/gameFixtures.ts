import {
  contextForPack,
  createNewGame,
  dispatch,
  type GameAction,
  type GameContext,
  type GameState,
} from '@/game';

/** Tests use the original pack: its ids are stable and it always ships. */
export const ctx: GameContext = contextForPack('original')!;

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

export function veteran(state: GameState, completed = 5): GameState {
  return { ...state, standing: { ...state.standing, missionsCompleted: completed } };
}

export function lastEntry(state: GameState) {
  return state.journal.entries.at(-1);
}
