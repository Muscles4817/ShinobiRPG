import { RESCUED_START_BOND, type Companions } from '@/systems/companions';
import { knowsRecipe, learnRecipes, type Cooking } from '@/systems/cooking';
import { addGear, addScroll, owns, ownsScroll, type Inventory } from '@/systems/inventory';
import type { JournalChip } from '@/systems/journal';
import type { MissionDef } from '@/systems/missions';

import { withNewCompanion } from './companions/adopt';
import { playerCompanion } from './companions/make';
import type { GameContext } from './context';
import { chip } from './ops';
import type { GameState } from './state';

/**
 * What a client hands over besides ryo on success: a technique scroll (studied at home or in a
 * library), a piece of gear such as a named weapon, a family recipe, or an animal you rescued
 * that follows you home (only if you have no companion: otherwise the client keeps it). Nothing
 * you already own or know is given twice.
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
      companionKindId !== undefined && !playerCompanion(state)
        ? content.companionKinds.require(companionKindId)
        : null,
  };
}

export function handedOver(state: GameState, ctx: GameContext, def: MissionDef): HandedOver {
  const { scroll, gear, recipe, animal } = giftsOf(state, ctx, def);
  const withScroll = scroll ? addScroll(state.inventory, scroll.id) : state.inventory;
  const companions = animal
    ? withNewCompanion(state, animal, RESCUED_START_BOND).companions
    : state.companions;
  const companion = animal ? playerCompanion({ companions })?.name : undefined;
  return {
    inventory: gear ? addGear(withScroll, gear.id) : withScroll,
    cooking: recipe ? learnRecipes(state.cooking, [recipe.id]) : state.cooking,
    companions,
    chips: [
      ...(scroll ? [chip(`${scroll.name} scroll`, 'gain')] : []),
      ...(gear ? [chip(gear.name, 'gain')] : []),
      ...(recipe ? [chip(`Learned ${recipe.name}`, 'gain')] : []),
      ...(companion ? [chip(`${companion} follows you home`, 'gain')] : []),
    ],
    report: {
      ...(scroll ? { scroll: scroll.name } : {}),
      ...(gear ? { gear: gear.name } : {}),
      ...(recipe ? { recipe: recipe.name } : {}),
      ...(companion ? { companion } : {}),
    },
  };
}
