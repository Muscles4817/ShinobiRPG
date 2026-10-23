import { learnRecipes } from '@/systems/cooking';
import { stock } from '@/systems/inventory';
import type { TravellerGift } from '@/systems/missions';
import { diffStats } from '@/systems/stats';
import { meetTraveller } from '@/systems/travel';

import { hearOf } from '../atlas';
import type { GameContext } from '../context';
import { noteFinds } from '../fieldBook/record';
import { growCharacter, logDiscoveries } from '../growth';
import { chip, log, spendTime, statChips } from '../ops';
import type { GameState } from '../state';
import type { RoadAfter, RoadChoice } from './roadChoices';
import { nearestUnheardOf } from './travellers';

/**
 * What a road choice does beyond its story (`roadChoices.ts`): foes faced become the stage in
 * the way, a find goes in your pack, waiting out the weather costs part of the day, and a
 * sight watched teaches a little, as a landmark's does, and someone of the road remembers the
 * meeting and may leave you something.
 */
export function afterRoadChoice(state: GameState, ctx: GameContext, choice: RoadChoice): GameState {
  return choice.after ? after(state, ctx, choice.after, choice.option.reply) : state;
}

function after(state: GameState, ctx: GameContext, then: RoadAfter, text: string): GameState {
  switch (then.kind) {
    case 'face': {
      const run = state.mission;
      if (!run) return state;
      const { roadEvent: _event, ...kept } = run;
      return { ...state, mission: { ...kept, detour: then.stage } };
    }
    case 'take': {
      const found = noteFinds(state, [then.ingredientId]);
      const inventory = stock(found.inventory, then.ingredientId);
      const name = ctx.content.ingredients.require(then.ingredientId).name;
      return log({ ...found, inventory }, { text, tone: 'success', chips: [chip(name, 'gain')] });
    }
    case 'wait':
      return spendTime(state, then.slots, ctx);
    case 'watch': {
      const grown = growCharacter(state.character, then.reward, ctx);
      const changed = diffStats(state.character.stats, grown.character.stats);
      const watched = { ...state, character: grown.character };
      const logged = log(watched, { text, tone: 'success', chips: statChips(changed) });
      return logDiscoveries(logged, grown.discovered, ctx);
    }
    case 'meet': {
      const atlas = meetTraveller(state.atlas, then.travellerId, then);
      return then.gift ? given({ ...state, atlas }, ctx, then.gift, text) : { ...state, atlas };
    }
  }
}

/** A traveller's gift: a recipe taught, something from their pack, or word of a place. */
function given(state: GameState, ctx: GameContext, gift: TravellerGift, text: string): GameState {
  switch (gift.kind) {
    case 'recipe': {
      const cooking = learnRecipes(state.cooking, [gift.recipeId]);
      if (cooking === state.cooking) return state;
      const name = ctx.content.recipes.require(gift.recipeId).name;
      return log({ ...state, cooking }, { text, tone: 'success', chips: [chip(name, 'gain')] });
    }
    case 'ingredient': {
      const inventory = stock(state.inventory, gift.ingredientId);
      const name = ctx.content.ingredients.require(gift.ingredientId).name;
      return log({ ...state, inventory }, { text, tone: 'success', chips: [chip(name, 'gain')] });
    }
    case 'place': {
      const placeId = nearestUnheardOf(state, ctx);
      if (!placeId) return state;
      const name = ctx.content.locations.require(placeId).name;
      return log(hearOf(state, [placeId]), {
        text,
        tone: 'success',
        chips: [chip(`Heard of ${name}`, 'gain')],
      });
    }
  }
}
