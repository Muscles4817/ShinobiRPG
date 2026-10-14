import {
  combatScene,
  contextForPack,
  createNewGame,
  defaultDraft,
  dispatch,
  type CreationDraft,
  type GameAction,
  type GameContext,
  type GameState,
} from '@/game';
import { createDuelEngine } from '@/systems/combat';
import { GRADE_XP } from '@/systems/cooking';
import { maxChakra, MAX_HEALTH } from '@/systems/vitals';

/** Tests use the original pack: its ids are stable and it always ships. */
export const ctx: GameContext = contextForPack('original')!;

/** The same game with the shelved Classic style offered too, as the default. */
export const classicCtx: GameContext = { ...ctx, engines: [createDuelEngine(), ...ctx.engines] };

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

/** Puts every job on the board, so tests can take any job they are trusted with. */
export function postEverything(state: GameState, context: GameContext = ctx): GameState {
  const postings = context.content.missions.all
    .filter((m) => !m.standing)
    .map((m) => ({ missionId: m.id, postedDay: state.time.day, expiresDay: 9999 }));
  return { ...state, board: { ...state.board, refreshedDay: state.time.day, postings } };
}

/** Knows every recipe in the pack, never cooked, as a grade D cook: any rank C dish is in reach. */
export function knowEveryRecipe(state: GameState, context: GameContext = ctx): GameState {
  const known = Object.fromEntries(context.content.recipes.all.map((r) => [r.id, 0]));
  return { ...state, cooking: { ...state.cooking, xp: GRADE_XP.D, known } };
}

/** A game ready to play, with its team formed, every job posted and every recipe known. */
export function newGame(overrides: Partial<GameState> = {}, context: GameContext = ctx): GameState {
  const posted = postEverything(formTeam(freshGame(context), context), context);
  const ready = knowEveryRecipe(posted, context);
  return { ...ready, ...overrides };
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
      vitals: { ...state.character.vitals, health: MAX_HEALTH, chakra: maxChakra(typed) },
    },
  };
}

export function veteran(state: GameState, completed = 5): GameState {
  return { ...state, standing: { ...state.standing, missionsCompleted: completed } };
}

export function lastEntry(state: GameState) {
  return state.journal.entries.at(-1);
}

/**
 * One step through a mission, whatever it asks: fights are fought out, encounters met head-on,
 * checks taken with the first approach.
 */
export function pressOn(s: GameState, context: GameContext = ctx): GameState {
  if (s.combat) return fightOut(s, context);
  if (s.mission?.encounter)
    return act(s, { type: 'encounterApproach', approach: 'head-on' }, context);
  return dispatch(s, { type: 'missionContinue' }, context).ok
    ? act(s, { type: 'missionContinue' }, context)
    : act(s, { type: 'missionChoose', approachIndex: 0 }, context);
}

/**
 * Moves the mission on into its fight: steps into the encounter there and goes in head-on, or
 * (at a plain combat stage) simply starts the fight.
 */
export function intoFight(state: GameState, context: GameContext = ctx): GameState {
  const met = act(state, { type: 'missionContinue' }, context);
  return met.mission?.encounter && !met.combat
    ? act(met, { type: 'encounterApproach', approach: 'head-on' }, context)
    : met;
}

/** Picks something sensible every turn, whatever the engine, until the fight ends. */
export function fightOut(start: GameState, context: GameContext = ctx): GameState {
  let state = start;
  for (let i = 0; i < 300 && state.combat; i++) {
    const options = combatScene(state, context)!.options.filter((o) => !o.disabledReason);
    const pick =
      options.find((o) => o.id === 'begin' || o.id === 'round') ??
      options.find((o) => o.targeted) ??
      options.find((o) => o.kind === 'end') ??
      options.find((o) => o.kind === 'move') ??
      options[0]!;
    state = act(state, { type: 'combatAct', optionId: pick.id }, context);
  }
  return state;
}
