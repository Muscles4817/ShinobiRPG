import type { CookbookDef, IngredientDef, Stall } from '../../../types';

/**
 * Travelling merchants from the places around the village: the Shiomachi fish cart (the port
 * sells the same at its own market), the dune caravan and a pilgrim herbalist down from Mount
 * Reikon. Each sets up on Market Street every few days with its home's larder and a cookbook
 * of its dishes (`recipes.ts`). The cart's bream and clams are the shore's own (`shared/fish.ts`).
 */

export const REGIONAL_INGREDIENTS: readonly IngredientDef[] = [
  { id: 'kelp', name: 'Dried Kelp', cost: 10, icon: 'leaf', road: 10 },
  { id: 'dates', name: 'Dates', cost: 14, icon: 'tree', road: 20 },
  { id: 'dune-spices', name: 'Dune Spices', cost: 18, icon: 'leaf' },
  { id: 'mountain-herbs', name: 'Mountain Herbs', cost: 12, icon: 'leaf' },
  { id: 'chakra-fruit', name: 'Chakra Fruit', cost: 60, icon: 'tree' },
];

export const REGIONAL_COOKBOOKS: readonly CookbookDef[] = [
  {
    id: 'recipes-from-the-port',
    name: 'Recipes from the Port',
    description:
      'A fishwife’s book, swollen with sea air. Every recipe starts “first, buy it fresh”.',
    cost: 110,
    icon: 'scroll',
    recipeIds: ['sea-bream-rice', 'clam-miso', 'kelp-broth', 'grilled-bream', 'kelp-fish-broth'],
  },
  {
    id: 'caravan-cook',
    name: 'The Caravan Cook',
    description:
      'Recipes for a fire made of thorn scrub, written in a hand that sways like a camel.',
    cost: 120,
    icon: 'scroll',
    recipeIds: ['date-cakes', 'caravan-stew', 'spiced-dune-rice'],
  },
  {
    id: 'pilgrims-bowl',
    name: 'The Pilgrim’s Bowl',
    description: 'What the monks of Mount Reikon eat, and why. The last page is about the fruit.',
    cost: 150,
    icon: 'scroll',
    recipeIds: ['herb-tea', 'pilgrims-porridge', 'chakra-fruit-preserve'],
  },
];

export const TRAVELLING_STALLS: readonly Stall[] = [
  {
    name: 'The Shiomachi Fish Cart',
    blurb: 'Down from the port on ice, once a week',
    icon: 'fish',
    hours: ['morning', 'afternoon'],
    visits: { every: 7, on: 2 },
    foodIds: [],
    ingredientIds: ['sea-bream', 'clams', 'kelp'],
    cookbookIds: ['recipes-from-the-port'],
  },
  {
    name: 'The Dune Caravan',
    blurb: 'Camels in the square and spice in the air',
    icon: 'cart',
    hours: ['morning', 'afternoon', 'evening'],
    visits: { every: 12, on: 5 },
    foodIds: [],
    ingredientIds: ['dates', 'dune-spices'],
    cookbookIds: ['caravan-cook'],
  },
  {
    name: 'A Pilgrim Herbalist',
    blurb: 'A monk from Mount Reikon with a basket of strange things',
    icon: 'leaf',
    hours: ['morning'],
    visits: { every: 14, on: 9 },
    foodIds: [],
    ingredientIds: ['mountain-herbs', 'chakra-fruit'],
    cookbookIds: ['pilgrims-bowl'],
  },
];
