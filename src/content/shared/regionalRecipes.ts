import type { CookbookDef, IngredientDef, RecipeDef } from '../types';

/**
 * Dishes of the coast, the desert and the mountains, and the larder they need. Shared by every
 * pack: a port anywhere dries fish and kelp, a caravan anywhere carries dates. Each pack sells
 * them where its own country fits (a harbour market, a desert bazaar, a temple kitchen, or
 * travelling merchants).
 */

export const REGIONAL_INGREDIENTS: readonly IngredientDef[] = [
  { id: 'kelp', name: 'Dried Kelp', cost: 10, icon: 'leaf', road: 10 },
  { id: 'dried-fish', name: 'Dried Fish', cost: 15, icon: 'fish', road: 30 },
  { id: 'sea-salt', name: 'Sea Salt', cost: 5, icon: 'rice' },
  { id: 'dates', name: 'Dates', cost: 14, icon: 'tree', road: 20 },
  { id: 'dune-spices', name: 'Dune Spices', cost: 18, icon: 'leaf' },
  { id: 'mountain-herbs', name: 'Mountain Herbs', cost: 12, icon: 'leaf' },
  { id: 'chakra-fruit', name: 'Chakra Fruit', cost: 60, icon: 'tree' },
  { id: 'red-beans', name: 'Red Beans', cost: 9, icon: 'bowl' },
];

const PORT: readonly RecipeDef[] = [
  {
    id: 'sea-bream-rice',
    name: 'Sea Bream Rice',
    description:
      'A whole bream steamed on top of the rice, then flaked through it. Tastes of tide.',
    icon: 'fish',
    rank: 'D',
    method: 'steam',
    steps: { cut: 'whole' },
    ingredients: [
      { id: 'sea-bream', count: 1 },
      { id: 'rice', count: 1 },
    ],
    satiety: 60,
    energy: 10,
    buff: { studyElement: { water: 1.25 } },
  },
  {
    id: 'clam-miso',
    name: 'Clam Miso Soup',
    description:
      'Clams opened in miso broth. Port medics give it to anyone who swallowed seawater.',
    icon: 'bowl',
    rank: 'D',
    method: 'boil',
    steps: { cut: 'whole', finish: 'early' },
    ingredients: [
      { id: 'clams', count: 1 },
      { id: 'miso', count: 1 },
    ],
    satiety: 30,
    energy: 10,
    health: 15,
    buff: { hungerRate: 0.9 },
    provision: 'antidote',
  },
  {
    id: 'kelp-broth',
    name: 'Kelp Broth',
    description: 'A cup of clear kelp broth before bed. Fishermen swear it brings deep sleep.',
    icon: 'tea',
    rank: 'E',
    kind: 'snack',
    method: 'simmer',
    ingredients: [{ id: 'kelp', count: 1 }],
    satiety: 10,
    energy: 0,
    buff: { sleepHealing: 1.2 },
  },
  {
    id: 'grilled-bream',
    name: 'Salt-Crusted Bream',
    description: 'A bream baked whole in a shell of salt and cracked open at the table.',
    icon: 'fish',
    rank: 'C',
    method: 'grill',
    steps: { cut: 'whole', heat: 'steady', finish: 'on-time' },
    ingredients: [
      { id: 'sea-bream', count: 1 },
      { id: 'spices', count: 1 },
    ],
    satiety: 50,
    energy: 15,
    buff: { growth: { speed: 1.15, kenjutsu: 1.15 } },
  },
  {
    id: 'kelp-fish-broth',
    name: 'Kelp and Dried Fish Broth',
    description: 'Simmered slow, salted at the end. It keeps a body going through a cold watch.',
    icon: 'pot',
    rank: 'D',
    method: 'simmer',
    ingredients: [
      { id: 'dried-fish', count: 1 },
      { id: 'kelp', count: 1 },
      { id: 'sea-salt', count: 1 },
    ],
    satiety: 60,
    energy: 15,
    buff: { hungerRate: 0.85 },
  },
];

const DUNES: readonly RecipeDef[] = [
  {
    id: 'date-cakes',
    name: 'Date Cakes',
    description:
      'Dates pounded with rice into dense little cakes. Caravans cross deserts on these.',
    icon: 'dango',
    rank: 'D',
    kind: 'snack',
    method: 'steam',
    steps: { cut: 'fine' },
    ingredients: [
      { id: 'dates', count: 1 },
      { id: 'rice', count: 1 },
    ],
    satiety: 20,
    energy: 20,
    buff: { energyCost: 0.85 },
  },
  {
    id: 'caravan-stew',
    name: 'Caravan Stew',
    description: 'Vegetables, dates and a fistful of dune spice, stewed until the pot goes dark.',
    icon: 'pot',
    rank: 'C',
    method: 'simmer',
    ingredients: [
      { id: 'dune-spices', count: 1 },
      { id: 'dates', count: 1 },
      { id: 'vegetables', count: 1 },
    ],
    satiety: 65,
    energy: 15,
    buff: { growth: { stamina: 1.2, willpower: 1.1 } },
    provision: 'steady',
  },
  {
    id: 'spiced-dune-rice',
    name: 'Spiced Dune Rice',
    description: 'Rice fried golden with dune spice. Desert folk say it puts sand in your fists.',
    icon: 'rice',
    rank: 'D',
    method: 'fry',
    ingredients: [
      { id: 'rice', count: 1 },
      { id: 'dune-spices', count: 1 },
    ],
    satiety: 45,
    energy: 10,
    buff: { studyDiscipline: { taijutsu: 1.2, kenjutsu: 1.1 } },
  },
];

const MOUNTAIN: readonly RecipeDef[] = [
  {
    id: 'herb-tea',
    name: 'Mountain Herb Tea',
    description:
      'Bitter, green and very hot. The monks drink it before they sit to sense the wind.',
    icon: 'tea',
    rank: 'E',
    kind: 'snack',
    method: 'boil',
    steps: { cut: 'whole', finish: 'late' },
    ingredients: [{ id: 'mountain-herbs', count: 1 }],
    satiety: 5,
    energy: 5,
    buff: { checks: { perception: 1.1, chakraControl: 1.1 } },
  },
  {
    id: 'pilgrims-porridge',
    name: 'Pilgrim’s Porridge',
    description: 'Rice and herbs cooked to a soft porridge. What the monks feed the injured.',
    icon: 'bowl',
    rank: 'D',
    method: 'simmer',
    steps: { cut: 'fine' },
    ingredients: [
      { id: 'rice', count: 1 },
      { id: 'mountain-herbs', count: 1 },
    ],
    satiety: 40,
    energy: 5,
    health: 10,
    buff: { injuryNights: 1, sleepHealing: 1.1 },
  },
  {
    id: 'chakra-fruit-preserve',
    name: 'Chakra Fruit Preserve',
    description:
      'The rare fruit of the spirit groves, simmered down with beans. It hums on the tongue.',
    icon: 'tree',
    rank: 'B',
    method: 'simmer',
    steps: { cut: 'fine', finish: 'late' },
    ingredients: [
      { id: 'chakra-fruit', count: 1 },
      { id: 'red-beans', count: 1 },
    ],
    satiety: 25,
    energy: 15,
    chakra: 30,
    buff: { growth: { reserves: 1.15 }, studyDiscipline: { ninjutsu: 1.2 } },
    provision: 'fortified',
  },
];

export const REGIONAL_RECIPES: readonly RecipeDef[] = [...PORT, ...DUNES, ...MOUNTAIN];

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
    description: 'What the mountain monks eat, and why. The last page is about the fruit.',
    cost: 150,
    icon: 'scroll',
    recipeIds: ['herb-tea', 'pilgrims-porridge', 'chakra-fruit-preserve'],
  },
];
