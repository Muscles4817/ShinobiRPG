import { CONTENT_PACKS } from '@/content';
import {
  createGameContext,
  dispatch,
  type GameAction,
  type GameContext,
  type GameState,
} from '@/game';
import type { CombatEngine, CombatSetup } from '@/systems/combat';
import type { StatId } from '@/systems/stats';

import { act, ctx, newGame, veteran, withAllStats } from './gameFixtures';

/** Far beyond any check in the packs: whatever is rolled with it succeeds. */
export const SURE = 60;
/** Far beyond anyone's stats: whatever is rolled against it fails. */
const HOPELESS = 60;

const original = CONTENT_PACKS.find((p) => p.id === 'original')!;

/**
 * The original pack with foes who can't be scouted, fooled or talked round: every recon,
 * sneak, talk and threat against them fails.
 */
export const hardCtx: GameContext = createGameContext({
  ...original,
  encounters: original.encounters.map((t) => ({
    ...t,
    resolve: HOPELESS,
    recon: t.recon.map((r) => ({ ...r, difficulty: HOPELESS })),
  })),
  enemies: original.enemies.map((e) => ({
    ...e,
    statBonuses: { ...e.statBonuses, perception: HOPELESS, willpower: HOPELESS },
  })),
});

/** A context whose fights record how they were set up. */
export function spying(context: GameContext = ctx): {
  context: GameContext;
  setups: CombatSetup[];
} {
  const setups: CombatSetup[] = [];
  const engines = context.engines.map((engine): CombatEngine => ({
    ...engine,
    start: (setup, rng) => {
      setups.push(setup);
      return engine.start(setup, rng);
    },
  }));
  return { context: { ...context, engines }, setups };
}

/** A capable veteran (every stat `SURE`), with every job posted. */
export function capable(context: GameContext = ctx): GameState {
  return withAllStats(veteran(newGame({}, context), 5), SURE);
}

/** Takes a job and plays it up to its encounter, stepping into it. */
export function atEncounter(
  missionId: string,
  start: GameState = capable(),
  context: GameContext = ctx,
): GameState {
  let s = act(start, { type: 'startMission', missionId }, context);
  for (let i = 0; i < 10 && !s.mission?.encounter; i++) {
    const next: GameAction = dispatch(s, { type: 'missionContinue' }, context).ok
      ? { type: 'missionContinue' }
      : { type: 'missionChoose', approachIndex: 0 };
    s = act(s, next, context);
  }
  return s;
}

/** The character with some stats changed. */
export function withStats(state: GameState, stats: Partial<Record<StatId, number>>): GameState {
  const { character } = state;
  return { ...state, character: { ...character, stats: { ...character.stats, ...stats } } };
}
