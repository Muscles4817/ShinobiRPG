import type { Rng } from '@/core';
import type { CombatEngine, CombatOutcome, CombatSetup, CombatState } from '@/systems/combat';

import type { GameContext } from './context';
import type { GameState, Settings } from './state';

/**
 * Which combat engine runs a fight. A fight in progress always continues in the engine that
 * started it; new fights use the save's chosen style (falling back to the default), starting
 * from whatever plan you set up last time in that style.
 */

export function defaultSettings(ctx: GameContext): Settings {
  return { combatStyle: ctx.engines[0]?.id ?? '', combatPlans: {} };
}

function firstEngine(ctx: GameContext): CombatEngine {
  const engine = ctx.engines[0];
  if (!engine) throw new Error('The game context has no combat engines');
  return engine;
}

/** The engine for the fight in progress, or for the next fight when there is none. */
export function engineFor(state: GameState, ctx: GameContext): CombatEngine {
  const id = state.combat?.engineId ?? state.settings.combatStyle;
  const engine = ctx.engines.find((e) => e.id === id);
  if (engine) return engine;
  if (state.combat) throw new Error(`No engine "${state.combat.engineId}" for this fight`);
  return firstEngine(ctx);
}

/** Starts a fight in the chosen style, handing the engine your plan from last time. */
export function startFight(
  state: GameState,
  ctx: GameContext,
  setup: CombatSetup,
  rng: Rng,
): CombatState {
  const engine = engineFor(state, ctx);
  const plan = state.settings.combatPlans[engine.id];
  return engine.start(plan === undefined ? setup : { ...setup, plan }, rng);
}

/** Keeps the plan a finished fight handed back, for the next fight in the same style. */
export function rememberPlan(
  state: GameState,
  engineId: string,
  outcome: CombatOutcome,
): GameState {
  if (outcome.plan === undefined) return state;
  const combatPlans = { ...state.settings.combatPlans, [engineId]: outcome.plan };
  return { ...state, settings: { ...state.settings, combatPlans } };
}
