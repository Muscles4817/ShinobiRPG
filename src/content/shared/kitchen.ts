import type { CookbookDef, IngredientDef } from '../types';

/**
 * Everyday ingredients and the cookbooks sold beside them. Shared by every pack: rice is rice
 * everywhere. The recipes themselves are in `recipes.ts`.
 */
export const INGREDIENTS: readonly IngredientDef[] = [
  { id: 'rice', name: 'Rice', cost: 8, icon: 'rice' },
  {
    id: 'river-fish',
    name: 'River Fish',
    cost: 14,
    icon: 'fish',
    length: [18, 36],
    family: 'freshwater',
  },
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
    recipeIds: ['hunters-skewers', 'tofu-congee', 'boar-hot-pot'],
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
  {
    id: 'fishmongers-knife',
    name: 'The Fishmonger’s Knife',
    description:
      'How to cut, salt, simmer and fry any fish worth the name. Half of it is about knives.',
    cost: 110,
    icon: 'scroll',
    recipeIds: [
      'stone-grilled-fish',
      'fish-rice',
      'miso-simmered-fish',
      'fish-ball-soup',
      'sashimi-plate',
      'fish-tempura',
    ],
  },
  {
    id: 'tide-and-shell',
    name: 'Tide and Shell',
    description:
      'A shore cook’s book, sand still in the spine. It tells you which tide to go out on.',
    cost: 130,
    icon: 'scroll',
    recipeIds: [
      'steamed-shellfish',
      'shore-hot-pot',
      'lamplit-squid',
      'grilled-turban-shell',
      'octopus-dumplings',
      'yellowtail-glaze',
      'laver-rice-rolls',
      'sea-lettuce-soup',
    ],
  },
  {
    id: 'marsh-and-falls',
    name: 'Marsh and Falls',
    description: 'Farm cooking from the paddies and the hills above them. Muddy fingerprints.',
    cost: 100,
    icon: 'scroll',
    recipeIds: [
      'carp-miso-stew',
      'loach-stew',
      'smelt-fry',
      'salmon-rice',
      'dropwort-congee',
      'water-chestnut-fritters',
      'butterbur-miso',
      'grated-yam-rice',
    ],
  },
];
