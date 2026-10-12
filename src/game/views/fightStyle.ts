import type { GameContext } from '../context';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

/** One fight style on offer, for the playtest switch on the Shinobi tab. */
export interface FightStyleOption extends Choice {
  readonly id: string;
  readonly label: string;
  readonly summary: string;
  readonly active: boolean;
}

/** The fight-style switch. With a single style on offer there is nothing to pick. */
export interface FightStyleMenu {
  readonly options: readonly FightStyleOption[];
  /** False when only one style is offered, so the switch is hidden. */
  readonly choosable: boolean;
}

export function fightStyles(state: GameState, ctx: GameContext): FightStyleMenu {
  const options = ctx.engines.map((engine) => ({
    ...choice(state, ctx, { type: 'setCombatStyle', style: engine.id }),
    id: engine.id,
    label: engine.label,
    summary: engine.summary,
    active: engine.id === state.settings.combatStyle,
  }));
  return { options, choosable: options.length > 1 };
}
