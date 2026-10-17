import { RESCUED_START_BOND, type Companions } from '@/systems/companions';
import { knowsRecipe, learnRecipes, type Cooking } from '@/systems/cooking';
import { addGear, addScroll, owns, ownsScroll, type Inventory } from '@/systems/inventory';
import type { JournalChip } from '@/systems/journal';
import type { MissionDef } from '@/systems/missions';

import { metToday } from './companions/adopt';
import type { GameContext } from './context';
import { chip } from './ops';
import type { GameState } from './state';

/**
 * What a client hands over besides ryo on success: a technique scroll (studied at home or in a
 * library), a piece of gear such as a named weapon, a family recipe, or an animal you rescued,
 * which waits at the animal clinic until you choose to take it home (one waits at a time).
 * Nothing you already own or know is given twice.
 */

export interface HandedOver {
  readonly inventory: Inventory;
  readonly cooking: Cooking;
  readonly companions: Companions;
  readonly chips: readonly JournalChip[];
  /** For the debrief card, by name. */
  readonly report: {
    readonly scroll?: string;
    readonly gear?: string;
    readonly recipe?: string;
    readonly companion?: string;
  };
}

/** What this client still has to give you: only what you don't own or know yet. */
function giftsOf(state: GameState, ctx: GameContext, def: MissionDef) {
  const { scrollId, gearId, recipeId, companionKindId } = def.reward;
  const { content } = ctx;
  return {
    scroll:
      scrollId !== undefined && !ownsScroll(state.inventory, scrollId)
        ? content.techniques.require(scrollId)
        : null,
    gear:
      gearId !== undefined && !owns(state.inventory, gearId) ? content.gear.require(gearId) : null,
    recipe:
      recipeId !== undefined && !knowsRecipe(state.cooking, recipeId)
        ? content.recipes.require(recipeId)
        : null,
    animal:
      companionKindId !== undefined && state.companions.waiting === null
        ? content.companionKinds.require(companionKindId)
        : null,
  };
}

export function handedOver(state: GameState, ctx: GameContext, def: MissionDef): HandedOver {
  const { scroll, gear, recipe, animal } = giftsOf(state, ctx, def);
  const withScroll = scroll ? addScroll(state.inventory, scroll.id) : state.inventory;
  const rescued = animal
    ? metToday(state, animal, { bond: RESCUED_START_BOND, arrival: 'rescue' })
    : null;
  const companions = rescued ? { ...state.companions, waiting: rescued } : state.companions;
  const companion = rescued?.name;
  return {
    inventory: gear ? addGear(withScroll, gear.id) : withScroll,
    cooking: recipe ? learnRecipes(state.cooking, [recipe.id]) : state.cooking,
    companions,
    chips: [
      ...(scroll ? [chip(`${scroll.name} scroll`, 'gain')] : []),
      ...(gear ? [chip(gear.name, 'gain')] : []),
      ...(recipe ? [chip(`Learned ${recipe.name}`, 'gain')] : []),
      ...(companion ? [chip(`${companion} is at the animal clinic`, 'gain')] : []),
    ],
    report: {
      ...(scroll ? { scroll: scroll.name } : {}),
      ...(gear ? { gear: gear.name } : {}),
      ...(recipe ? { recipe: recipe.name } : {}),
      ...(companion ? { companion } : {}),
    },
  };
}
