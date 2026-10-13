import type { CombatView } from '@/systems/combat';

import type { GameContext } from '../context';
import { combatFinaleView } from '../combatFinale';
import { engineFor } from '../fightStyle';
import { scoutOpponents, type ScoutingRead } from '../scouting';
import type { GameState } from '../state';

/** The fight scene's views: the fight in progress, the one just ended, and how foes read. */

export function combatScene(state: GameState, ctx: GameContext): CombatView | null {
  return state.combat ? engineFor(state, ctx).view(state.combat) : null;
}

/** A fight that has just ended, as a view with nothing left to choose, until you leave it. */
export function finishedFightScene(state: GameState): CombatView | null {
  return state.combatFinale ? combatFinaleView(state.combatFinale) : null;
}

/** How each opponent in the current fight sizes up against you. */
export function combatScouting(
  state: GameState,
  ctx: GameContext,
): Readonly<Record<string, ScoutingRead>> {
  const view = combatScene(state, ctx) ?? finishedFightScene(state);
  if (!view) return {};
  const foes = view.combatants.filter((c) => c.side === 'enemy').map((c) => c.id);
  return scoutOpponents(state, ctx, foes);
}
