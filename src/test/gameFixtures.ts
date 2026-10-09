import {
  contextForPack,
  createNewGame,
  defaultDraft,
  dispatch,
  type CreationDraft,
  type GameAction,
  type GameContext,
  type GameState,
} from '@/game';
import { maxChakra, maxHealth } from '@/systems/vitals';

/** Tests use the original pack: its ids are stable and it always ships. */
export const ctx: GameContext = contextForPack('original')!;

/** A clanless sensor, taijutsu specialist (A taijutsu, B ninjutsu, D genjutsu). */
export function draft(
  overrides: Partial<CreationDraft> = {},
  context: GameContext = ctx,
): CreationDraft {
  return { ...defaultDraft(context), name: 'Kaito', talentId: 'sensor', ...overrides };
}

/** A game straight out of character creation, before teams are read out. */
export function freshGame(context: GameContext = ctx): GameState {
  return createNewGame({ draft: draft({}, context), seed: 1234 }, context);
}

/** Reads out the teams and takes the first sensei offered, clearing the result card. */
export function formTeam(state: GameState, context: GameContext = ctx): GameState {
  const assigned = act(state, { type: 'assignTeam' }, context);
  const senseiId = assigned.people.team?.senseiOptions[0] ?? '';
  return { ...act(assigned, { type: 'chooseSensei', senseiId }, context), reports: [] };
}

/** A game ready to play, with its team formed. */
export function newGame(overrides: Partial<GameState> = {}, context: GameContext = ctx): GameState {
  return { ...formTeam(freshGame(context), context), ...overrides };
}

/** Dispatches an action, failing the test if it is refused. */
export function act(state: GameState, action: GameAction, context: GameContext = ctx): GameState {
  const result = dispatch(state, action, context);
  if (!result.ok) throw new Error(`Action ${action.type} refused: ${result.error}`);
  return result.value;
}

/** A character with every stat set to `value`, fully healed for those stats. */
export function withAllStats(state: GameState, value: number): GameState {
  const stats = Object.fromEntries(Object.keys(state.character.stats).map((k) => [k, value]));
  const typed = stats as GameState['character']['stats'];
  return {
    ...state,
    character: {
      ...state.character,
      stats: typed,
      vitals: { ...state.character.vitals, health: maxHealth(typed), chakra: maxChakra(typed) },
    },
  };
}

export function veteran(state: GameState, completed = 5): GameState {
  return { ...state, standing: { ...state.standing, missionsCompleted: completed } };
}

export function lastEntry(state: GameState) {
  return state.journal.entries.at(-1);
}
