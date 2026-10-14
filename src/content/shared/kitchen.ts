import type { CookbookDef, IngredientDef } from '../types';

/**
 * Everyday ingredients and the cookbooks sold beside them. Shared by every pack: rice is rice
 * everywhere. The recipes themselves are in `recipes.ts`.
 */
export const INGREDIENTS: readonly IngredientDef[] = [
  { id: 'rice', name: 'Rice', cost: 8, icon: 'rice' },
  { id: 'river-fish', name: 'River Fish', cost: 14, icon: 'fish' },
  { id: 'vegetables', name: 'Vegetables', cost: 10, icon: 'veg' },
  { id: 'miso', name: 'Miso', cost: 9, icon: 'bowl' },
  { id: 'spices', name: 'Spices', cost: 12, icon: 'leaf' },
  { id: 'eggs', name: 'Eggs', cost: 9, icon: 'bowl' },
  { id: 'tofu', name: 'Tofu', cost: 7, icon: 'veg' },
  // Dried rice cakes and salted fish, wrapped for the road: a day's meal away from home.
  { id: 'travel-rations', name: 'Travel Rations', cost: 12, icon: 'rice', road: 25 },
  // The grocer only has these in their season.
  { id: 'bamboo-shoots', name: 'Bamboo Shoots', cost: 10, icon: 'leaf', seasons: ['Spring'] },
  { id: 'cucumbers', name: 'Cucumbers', cost: 6, icon: 'veg', seasons: ['Summer'] },
  { id: 'chestnuts', name: 'Chestnuts', cost: 11, icon: 'tree', seasons: ['Autumn'] },
  { id: 'winter-radish', name: 'Winter Radish', cost: 8, icon: 'veg', seasons: ['Winter'] },
];

/** Cookbooks every grocer can stock: together they teach every shared dish nobody starts with. */
export const COOKBOOKS: readonly CookbookDef[] = [
  {
    id: 'everyday-kitchen',
    name: 'The Everyday Kitchen',
    description: 'A grease-spotted book of plain, honest suppers. Someone has underlined “rest”.',
    cost: 60,
    icon: 'scroll',
    recipeIds: ['grilled-fish-set', 'simmered-tofu', 'fish-bone-broth'],
  },
  {
    id: 'year-of-rice',
    name: 'A Year of Rice',
    description: 'One rice dish for every season, each with a pressed leaf between the pages.',
    cost: 120,
    icon: 'scroll',
    recipeIds: ['bamboo-rice', 'cucumber-rice', 'chestnut-rice', 'radish-stew'],
  },
  {
    id: 'food-for-the-road',
    name: 'Food for the Road',
    description: 'Written by a courier who never stopped walking. Short recipes, long margins.',
    cost: 90,
    icon: 'scroll',
    recipeIds: ['hunters-skewers', 'tofu-congee'],
  },
  {
    id: 'foragers-notes',
    name: 'A Forager’s Notes',
    description: 'Pressed leaves, sketches of mushrooms, and which ones killed whom.',
    cost: 80,
    icon: 'scroll',
    recipeIds: ['mushroom-rice', 'greens-miso', 'ginger-broth'],
  },
  {
    id: 'river-cook',
    name: 'The River Cook',
    description: 'A fisherman’s recipes, written in pencil that has run in the damp.',
    cost: 100,
    icon: 'scroll',
    recipeIds: ['salt-grilled-sweetfish', 'grilled-eel', 'crayfish-boil', 'watercress-soup'],
  },
];
