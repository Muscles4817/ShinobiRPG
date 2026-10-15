import { RANK_LABELS } from '@/systems/standing';

import type { GameContext } from '../context';
import type { GameState } from '../state';

/** The main menu's line for the saved game: who you are, where, and how far in. */
export interface SaveSummary {
  readonly name: string;
  /** e.g. "Genin of the Hidden Leaf, day 12". */
  readonly line: string;
}

export function saveSummary(state: GameState, ctx: GameContext): SaveSummary {
  const { name, familyName } = state.character;
  const rank = RANK_LABELS[state.standing.rank];
  return {
    name: [name, familyName].filter(Boolean).join(' '),
    line: `${rank} in ${ctx.content.packName}, day ${state.time.day}`,
  };
}
