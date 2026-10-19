import type { CombatView } from '@/systems/combat';

import type { GameContext } from '../context';
import { combatFinaleView } from '../combatFinale';
import { engineFor } from '../fightStyle';
import { scoutOpponents, type ScoutingRead } from '../scouting';
import type { GameState } from '../state';
import { jutsuCard, type JutsuCard } from './you';

/**
 * The fight scene's views: the fight in progress, the one just ended, how foes read, and a
 * technique one of your cards plays.
 */

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

/**
 * A technique your card plays, as its card in the Jutsu deck reads it: what the desktop shows
 * beside the plan while the card is pointed at. Null for a technique the pack doesn't have.
 */
export function fightTechnique(
  state: GameState,
  ctx: GameContext,
  techniqueId: string,
): JutsuCard | null {
  const def = ctx.content.techniques.get(techniqueId);
  return def ? jutsuCard(state, ctx, def) : null;
}
