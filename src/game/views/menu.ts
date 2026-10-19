import { lookOf, type Look } from '@/systems/profile';
import { RANK_LABELS } from '@/systems/standing';
import { slotName } from '@/systems/time';

import type { GameContext } from '../context';
import { currentLocation } from '../ops';
import type { GameState } from '../state';

/**
 * The main menu's card for the saved game: who you are, where, and how far in. The phone menu
 * reads it as one line; the desktop menu as a save card with your portrait.
 */
export interface SaveSummary {
  readonly name: string;
  /** e.g. "Genin of the Hidden Leaf, day 12". */
  readonly line: string;
  readonly rank: string;
  /** Where you are now: your village, or a town you have travelled to. */
  readonly place: string;
  readonly day: number;
  /** "Morning", "Night"… */
  readonly slot: string;
  readonly appearance: Look;
}

export function saveSummary(state: GameState, ctx: GameContext): SaveSummary {
  const { name, familyName, appearance } = state.character;
  const rank = RANK_LABELS[state.standing.rank];
  return {
    name: [name, familyName].filter(Boolean).join(' '),
    line: `${rank} in ${ctx.content.packName}, day ${state.time.day}`,
    rank,
    place: currentLocation(state, ctx).name,
    day: state.time.day,
    slot: slotName(state.time),
    appearance: lookOf(appearance, `player:${name}`, 'young'),
  };
}
