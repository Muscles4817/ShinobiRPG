import type { CookbookDef, IngredientDef, RecipeDef } from '../types';

/**
 * What a beaten chakra beast leaves for the pot (`EnemyDef.drops`), and the dishes made from
 * it (`docs/design/chakra-beasts-plan.md`). Nobody sells the meat: you bring it out of the wild
 * yourself. The dishes are in a hunter's book sold at home, and can be worked out at the stove.
 */

export const BEAST_INGREDIENTS: readonly IngredientDef[] = [
  { id: 'ember-boar-flank', name: 'Ember Boar Flank', cost: 60, icon: 'pot' },
  { id: 'thunder-eel', name: 'Thunder Eel', cost: 55, icon: 'fish' },
  { id: 'serow-haunch', name: 'Stone Serow Haunch', cost: 50, icon: 'pot' },
  { id: 'moss-bear-fat', name: 'Moss Bear Fat', cost: 120, icon: 'pot' },
  { id: 'glass-venom-sac', name: 'Glass Scorpion Venom Sac', cost: 80, icon: 'bowl' },
  { id: 'tide-crab-claw', name: 'Tide Crab Claw', cost: 45, icon: 'fish' },
];

export const BEAST_RECIPES: readonly RecipeDef[] = [
  {
    id: 'ember-boar-skewers',
    name: 'Ember Boar Skewers',
    description:
      'The meat is warm before it goes near the fire, and you feel it in your chest after.',
    icon: 'pot',
    rank: 'C',
    method: 'grill',
    steps: { cut: 'chunky' },
    ingredients: [
      { id: 'ember-boar-flank', count: 1 },
      { id: 'spices', count: 1 },
    ],
    satiety: 55,
    energy: 15,
    chakra: 35,
    buff: {},
  },
  {
    id: 'thunder-eel-rice',
    name: 'Thunder Eel over Rice',
    description:
      'Grilled eel on rice. It leaves your fingertips prickling for the rest of the day.',
    icon: 'rice',
    rank: 'C',
    method: 'grill',
    ingredients: [
      { id: 'thunder-eel', count: 1 },
      { id: 'rice', count: 1 },
    ],
    satiety: 55,
    energy: 15,
    buff: { studyElement: { lightning: 1.2, water: 1.2 } },
  },
  {
    id: 'serow-stew',
    name: 'Serow Haunch Stew',
    description:
      'Mountain meat stewed all afternoon with roots. Hunters eat it before a long climb.',
    icon: 'pot',
    rank: 'C',
    method: 'simmer',
    ingredients: [
      { id: 'serow-haunch', count: 1 },
      { id: 'vegetables', count: 1 },
      { id: 'miso', count: 1 },
    ],
    satiety: 70,
    energy: 20,
    buff: { training: 1.1 },
  },
  {
    id: 'moss-bear-broth',
    name: 'Moss Bear Broth',
    description:
      'A little of the fat goes a long way. Old hunters keep it for wounds that won’t close.',
    icon: 'bowl',
    rank: 'B',
    method: 'simmer',
    ingredients: [
      { id: 'moss-bear-fat', count: 1 },
      { id: 'vegetables', count: 1 },
    ],
    satiety: 45,
    energy: 10,
    health: 35,
    buff: { injuryNights: 1 },
  },
  {
    id: 'venom-sac-tonic',
    name: 'Venom Sac Tonic',
    description:
      'A drop of the venom boiled down with ginger. It burns going down, and after a cup a sting hardly troubles you.',
    icon: 'bowl',
    rank: 'B',
    method: 'boil',
    ingredients: [
      { id: 'glass-venom-sac', count: 1 },
      { id: 'wild-ginger', count: 1 },
    ],
    satiety: 15,
    energy: 5,
    buff: {},
    provision: 'antidote',
  },
  {
    id: 'tide-crab-in-the-shell',
    name: 'Tide Crab in the Shell',
    description: 'One claw feeds a table. It is steamed whole and cracked open with a mallet.',
    icon: 'fish',
    rank: 'C',
    method: 'steam',
    steps: { cut: 'whole' },
    ingredients: [{ id: 'tide-crab-claw', count: 1 }],
    satiety: 50,
    energy: 10,
    buff: { bondGain: 1.3 },
  },
];

export const BEAST_COOKBOOK: CookbookDef = {
  id: 'deep-hunters-pot',
  name: 'The Deep Hunter’s Pot',
  description: 'A hunter’s notebook from the deep woods. Some pages are scorched, and one is wet.',
  cost: 180,
  icon: 'scroll',
  recipeIds: BEAST_RECIPES.map((r) => r.id),
};
