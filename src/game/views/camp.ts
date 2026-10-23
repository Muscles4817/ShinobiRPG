import type { GameContext } from '../context';
import { placeHere } from '../ops';
import { rationDays } from '../road';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

/** A camp in wild country: the spot, the days of food in your pack, and making camp. */
export interface CampView {
  readonly name: string;
  readonly blurb: string;
  readonly rations: number;
  readonly makeCamp: Choice;
}

export function campView(state: GameState, ctx: GameContext): CampView | null {
  const camp = placeHere(state, ctx, 'camp');
  if (!camp) return null;
  return {
    name: camp.name,
    blurb: camp.blurb,
    rations: rationDays(state, ctx),
    makeCamp: choice(state, ctx, { type: 'makeCamp' }),
  };
}
