import type { CookbookDef, IngredientDef, RecipeDef } from '../../types';
import { COOKBOOKS, INGREDIENTS } from '../../shared/kitchen';
import { RECIPES } from '../../shared/recipes';
import { WILD_INGREDIENTS } from '../../shared/wilds';
import { BEAST_INGREDIENTS } from '../../shared/beastKitchen';
import { DESERT_INGREDIENTS } from '../../shared/desert';
import {
  REGIONAL_COOKBOOKS,
  REGIONAL_INGREDIENTS,
  REGIONAL_RECIPES,
} from '../../shared/regionalRecipes';

/**
 * The fan pack's kitchen: the shared larder, recipes and cookbooks (the fan pack has no dishes
 * of its own to cook yet). Joined inside pure-annotated functions so a release build drops them
 * with the pack.
 */
export const NARUTO_INGREDIENTS: readonly IngredientDef[] = /*#__PURE__*/ (() => [
  ...INGREDIENTS,
  ...WILD_INGREDIENTS,
  ...BEAST_INGREDIENTS,
  ...DESERT_INGREDIENTS,
  ...REGIONAL_INGREDIENTS,
])();
export const NARUTO_RECIPES: readonly RecipeDef[] = /*#__PURE__*/ (() => [
  ...RECIPES,
  ...REGIONAL_RECIPES,
])();
export const NARUTO_COOKBOOKS: readonly CookbookDef[] = /*#__PURE__*/ (() => [
  ...COOKBOOKS,
  ...REGIONAL_COOKBOOKS,
])();
