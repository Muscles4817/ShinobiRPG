import { GEAR_SLOTS } from '@/content';
import { addGear, equip, owns, stock, unequip } from '@/systems/inventory';
import { spend } from '@/systems/wallet';

import type { GameContext } from '../context';
import { busyReason, chip, firstBlocker, log, placeHere, placesHere } from '../ops';
import type { GameState } from '../state';
import type { ActionHandler, ActionOf } from './types';

/** Buying and wearing gear, and stocking the pantry. */

function soldHere(state: GameState, ctx: GameContext, gearId: string): boolean {
  return placesHere(state, ctx, 'gear').some((p) => p.gearIds.includes(gearId));
}

function groceriesHere(state: GameState, ctx: GameContext, ingredientId: string): boolean {
  const market = placeHere(state, ctx, 'market');
  return market?.stalls.some((s) => s.ingredientIds?.includes(ingredientId)) ?? false;
}

export const buyGear: ActionHandler<ActionOf<'buyGear'>> = {
  check(state, action, ctx) {
    const def = ctx.content.gear.get(action.gearId);
    if (!def || !soldHere(state, ctx, def.id)) return 'That isn’t sold here.';
    return firstBlocker(
      busyReason(state),
      owns(state.inventory, def.id) && 'You already own this.',
      state.wallet.ryo < def.cost && `You can’t afford it (${def.cost} ryo).`,
    );
  },
  perform(state, action, ctx) {
    const def = ctx.content.gear.require(action.gearId);
    const paid = spend(state.wallet, def.cost);
    if (!paid.ok) return state;
    const bought = addGear(state.inventory, def.id);
    // A new piece goes straight on if the slot is empty.
    const inventory = bought.equipped[def.slot] ? bought : equip(bought, def.slot, def.id);
    return log(
      { ...state, wallet: paid.value, inventory },
      {
        heading: `Bought ${def.name}`,
        text: def.description,
        tone: 'success',
        chips: [chip(`−${def.cost} ryo`, 'cost')],
      },
    );
  },
};

export const equipGear: ActionHandler<ActionOf<'equipGear'>> = {
  check(state, action, ctx) {
    const def = ctx.content.gear.get(action.gearId);
    if (!def || !owns(state.inventory, def.id)) return 'You don’t own that.';
    return firstBlocker(
      busyReason(state),
      state.inventory.equipped[def.slot] === def.id && 'You’re already wearing it.',
    );
  },
  perform(state, action, ctx) {
    const def = ctx.content.gear.require(action.gearId);
    return { ...state, inventory: equip(state.inventory, def.slot, def.id) };
  },
};

export const unequipGear: ActionHandler<ActionOf<'unequipGear'>> = {
  check(state, action) {
    if (!(GEAR_SLOTS as readonly string[]).includes(action.slot)) return 'Unknown slot.';
    return firstBlocker(
      busyReason(state),
      !state.inventory.equipped[action.slot] && 'Nothing to take off.',
    );
  },
  perform(state, action) {
    return { ...state, inventory: unequip(state.inventory, action.slot) };
  },
};

export const buyIngredient: ActionHandler<ActionOf<'buyIngredient'>> = {
  check(state, action, ctx) {
    const def = ctx.content.ingredients.get(action.ingredientId);
    if (!def || !groceriesHere(state, ctx, def.id)) return 'That isn’t sold here.';
    return firstBlocker(
      busyReason(state),
      state.wallet.ryo < def.cost && `You can’t afford it (${def.cost} ryo).`,
    );
  },
  perform(state, action, ctx) {
    const def = ctx.content.ingredients.require(action.ingredientId);
    const paid = spend(state.wallet, def.cost);
    if (!paid.ok) return state;
    return { ...state, wallet: paid.value, inventory: stock(state.inventory, def.id) };
  },
};
