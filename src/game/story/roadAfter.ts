import { stock } from '@/systems/inventory';
import { diffStats } from '@/systems/stats';

import type { GameContext } from '../context';
import { noteFinds } from '../fieldBook/record';
import { growCharacter, logDiscoveries } from '../growth';
import { chip, log, spendTime, statChips } from '../ops';
import type { GameState } from '../state';
import type { RoadAfter, RoadChoice } from './roadChoices';

/**
 * What a road choice does beyond its story (`roadChoices.ts`): foes faced become the stage in
 * the way, a find goes in your pack, waiting out the weather costs part of the day, and a
 * sight watched teaches a little, as a landmark's does.
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
  }
}
