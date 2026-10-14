import type { GameContext } from '../context';
import { placeHere } from '../ops';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

/** The inn's front desk: who keeps it, what a room costs, and taking one for the night. */
export interface InnView {
  readonly name: string;
  readonly keeper: string;
  readonly blurb: string;
  readonly roomCost: number;
  readonly takeRoom: Choice;
}

export function innView(state: GameState, ctx: GameContext): InnView | null {
  const inn = placeHere(state, ctx, 'inn');
  if (!inn) return null;
  return {
    name: inn.name,
    keeper: inn.keeper,
    blurb: inn.blurb,
    roomCost: inn.roomCost,
    takeRoom: choice(state, ctx, { type: 'takeRoom' }),
  };
}
