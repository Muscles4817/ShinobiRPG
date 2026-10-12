import { ok } from '@/core';
import type { GameContext, GameState } from '@/game';
import type {
  CombatEngine,
  CombatOutcome,
  CombatSetup,
  CombatState,
  CombatView,
} from '@/systems/combat';
import { createStats } from '@/systems/stats';

import { ctx, newGame, veteran } from './gameFixtures';

/** Autumn's seventh day in the first year: the original pack's exam (season 2, day 7). */
export const EXAM_DAY = 2 * 28 + 7;
/** Every stat at this is ready by any sensei's judgement (C). */
const READY = 14;
/** A stat at D. */
const D_GRADE = 9;

/** A save on the morning of the exam: nominated, a record of jobs, a team that is ready. */
export function examDay(context: GameContext = ctx, base: GameState = newGame({}, context)) {
  const state = veteran(base, 12);
  const team = state.people.team;
  const senseiId = team?.senseiId ?? '';
  const ready = createStats(READY);
  const progress = Object.fromEntries(
    (team?.teammateIds ?? []).map((id) => [id, { stats: ready, lastGrownDay: EXAM_DAY }]),
  );
  return {
    ...state,
    time: { day: EXAM_DAY, slot: 0 },
    character: {
      ...state.character,
      stats: { ...state.character.stats, taijutsu: READY, strength: D_GRADE, speed: D_GRADE },
    },
    people: {
      ...state.people,
      progress: { ...state.people.progress, ...progress },
      bonds: {
        ...state.people.bonds,
        [senseiId]: { points: 40, lastTalkDay: null, heard: [] },
      },
    },
  } satisfies GameState;
}

/** Fights end on the first choice, the way the script says: the engine is a stand-in. */
export interface Script {
  readonly result: CombatOutcome['result'];
  /** Your health when it ends. */
  readonly health?: number;
  /** Your teammates' health when it ends (all the same). */
  readonly allies?: number;
  /** Techniques you are said to have used. */
  readonly used?: readonly string[];
}

interface Scripted {
  readonly setup: CombatSetup;
  readonly done: boolean;
}

function viewOf(state: CombatState, script: Script): CombatView {
  // The stand-in engine's own state.
  const data = state.data as Scripted;
  const ally = (c: CombatSetup['allies'][number]) => ({
    id: c.id,
    name: c.name,
    side: 'player' as const,
    health: script.allies ?? c.health,
    maxHealth: c.maxHealth,
    chakra: c.chakra,
    maxChakra: c.maxChakra,
    statuses: [],
  });
  return {
    round: 1,
    combatants: [
      { ...ally(data.setup.player), health: script.health ?? data.setup.player.health },
      ...data.setup.allies.map(ally),
      ...data.setup.enemies.map((c) => ({ ...ally(c), side: 'enemy' as const, health: 0 })),
    ],
    log: [],
    options: data.done
      ? []
      : [{ id: 'end', label: 'End it', detail: '', kind: 'continue' as const }],
  };
}

/** A context whose fights end at once as scripted (the stand-in takes the default style's id). */
export function scriptedCtx(script: Script, context: GameContext = ctx): GameContext {
  const id = context.engines[0]?.id ?? 'plan-v1';
  const engine: CombatEngine = {
    id,
    label: 'Scripted',
    summary: '',
    start: (setup) => ({ engineId: id, data: { setup, done: false } satisfies Scripted }),
    act: (state) => ok({ ...state, data: { ...(state.data as Scripted), done: true } }),
    view: (state) => viewOf(state, script),
    outcome: (state) => {
      const data = state.data as Scripted;
      if (!data.done) return null;
      return {
        result: script.result,
        rounds: 1,
        player: { health: script.health ?? data.setup.player.health, chakra: 0 },
        used: { player: { techniqueIds: [...(script.used ?? [])], chakraSpent: 0 } },
      };
    },
  };
  return { ...context, engines: [engine] };
}
