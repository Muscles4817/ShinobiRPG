import type { IconId } from '@/content';
import { METER_MAX } from '@/systems/vitals';

import type { GameContext } from '../context';
import { placeHere } from '../ops';
import type { GameState } from '../state';
import { choice, type Choice } from './common';

export interface MarketItem extends Choice {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: IconId;
  readonly cost: number;
  readonly satiety: number;
  readonly energy: number;
  readonly slots: number;
  /** How full you'd be after eating it. */
  readonly fullAfter: number;
}

export interface MarketView {
  readonly name: string;
  readonly ryo: number;
  readonly fullness: number;
  readonly stalls: readonly {
    readonly name: string;
    readonly blurb: string;
    readonly icon: IconId;
    readonly items: readonly MarketItem[];
  }[];
}

export function marketView(state: GameState, ctx: GameContext): MarketView | null {
  const place = placeHere(state, ctx, 'market');
  if (!place) return null;
  const fullness = Math.round(state.character.vitals.satiety);
  return {
    name: place.name,
    ryo: state.wallet.ryo,
    fullness,
    stalls: place.stalls.map((stall) => ({
      name: stall.name,
      blurb: stall.blurb,
      icon: stall.icon,
      items: stall.foodIds.map((id) => {
        const food = ctx.content.foods.require(id);
        return {
          ...choice(state, ctx, { type: 'eat', foodId: id }),
          id,
          name: food.name,
          description: food.description,
          icon: food.icon,
          cost: food.cost,
          satiety: food.satiety,
          energy: food.energy,
          slots: food.slots,
          fullAfter: Math.min(METER_MAX, fullness + food.satiety),
        };
      }),
    })),
  };
}
