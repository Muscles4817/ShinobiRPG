import { ownsHouse } from '@/systems/housing';

import type { GameContext } from '../context';
import { placeHere } from '../ops';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

/** A house in a town: the deed for sale, or, once it is yours, a bed and a nap. */
export interface HouseView {
  readonly name: string;
  readonly seller: string;
  readonly blurb: string;
  readonly price: number;
  readonly owned: boolean;
  readonly buy: Choice;
  readonly sleep: Choice;
  readonly rest: Choice;
}

export function houseView(state: GameState, ctx: GameContext): HouseView | null {
  const house = placeHere(state, ctx, 'house');
  if (!house) return null;
  return {
    name: house.name,
    seller: house.seller,
    blurb: house.blurb,
    price: house.price,
    owned: ownsHouse(state.housing, house.id),
    buy: choice(state, ctx, { type: 'buyHouse' }),
    sleep: choice(state, ctx, { type: 'sleep' }),
    rest: choice(state, ctx, { type: 'rest' }),
  };
}
