import type { GameContext } from '../context';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

/** The fight styles on offer, for the playtest switch on the Shinobi tab. */
export interface FightStyleOption extends Choice {
  readonly id: string;
  readonly label: string;
  readonly summary: string;
  readonly active: boolean;
}

export function fightStyles(state: GameState, ctx: GameContext): FightStyleOption[] {
  return ctx.engines.map((engine) => ({
    ...choice(state, ctx, { type: 'setCombatStyle', style: engine.id }),
    id: engine.id,
    label: engine.label,
    summary: engine.summary,
    active: engine.id === state.settings.combatStyle,
  }));
}
