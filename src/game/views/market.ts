import type { IconId } from '@/content';
import { pantryCount } from '@/systems/inventory';
import { METER_MAX } from '@/systems/vitals';

import type { GameContext } from '../context';
import { placeHere } from '../ops';
import type { GameState } from '../state';
import { closedSign, festivalToday, marketPrice } from '../village';
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
  /** Fullness that would go to waste because you're already nearly full. */
  readonly wasted: number;
}

/** A raw ingredient at the grocer, to cook at home. */
export interface IngredientItem extends Choice {
  readonly id: string;
  readonly name: string;
  readonly icon: IconId;
  readonly cost: number;
  /** How many you already have in the pantry. */
  readonly inPantry: number;
}

export interface MarketView {
  readonly name: string;
  /** Today's festival, when prices are down. */
  readonly festival: string | null;
  readonly ryo: number;
  readonly fullness: number;
  readonly stalls: readonly {
    readonly name: string;
    readonly blurb: string;
    readonly icon: IconId;
    /** Why the stall is shut right now, or null when open. */
    readonly closed: string | null;
    readonly items: readonly MarketItem[];
    readonly ingredients: readonly IngredientItem[];
  }[];
}

export function marketView(state: GameState, ctx: GameContext): MarketView | null {
  const place = placeHere(state, ctx, 'market');
  if (!place) return null;
  const fullness = Math.round(state.character.vitals.satiety);
  return {
    name: place.name,
    festival: festivalToday(state, ctx)?.name ?? null,
    ryo: state.wallet.ryo,
    fullness,
    stalls: place.stalls.map((stall) => ({
      name: stall.name,
      blurb: stall.blurb,
      icon: stall.icon,
      closed: closedSign(stall.hours, state),
      items: stall.foodIds.map((id) => {
        const food = ctx.content.foods.require(id);
        return {
          ...choice(state, ctx, { type: 'eat', foodId: id }),
          id,
          name: food.name,
          description: food.description,
          icon: food.icon,
          cost: marketPrice(food.cost, state, ctx),
          satiety: food.satiety,
          energy: food.energy,
          slots: food.slots,
          wasted: Math.max(0, fullness + food.satiety - METER_MAX),
        };
      }),
      ingredients: (stall.ingredientIds ?? []).map((id) => {
        const item = ctx.content.ingredients.require(id);
        return {
          ...choice(state, ctx, { type: 'buyIngredient', ingredientId: id }),
          id,
          name: item.name,
          icon: item.icon,
          cost: marketPrice(item.cost, state, ctx),
          inPantry: pantryCount(state.inventory, id),
        };
      }),
    })),
  };
}
