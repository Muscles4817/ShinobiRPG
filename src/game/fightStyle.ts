import type { CombatEngine } from '@/systems/combat';

import type { GameContext } from './context';
import type { GameState, Settings } from './state';

/**
 * Which combat engine runs a fight. A fight in progress always continues in the engine that
 * started it; new fights use the save's chosen style (falling back to the default).
 */

export function defaultSettings(ctx: GameContext): Settings {
  return { combatStyle: ctx.engines[0]?.id ?? '' };
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
