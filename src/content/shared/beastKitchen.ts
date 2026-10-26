import type { CookbookDef, IngredientDef, RecipeDef } from '../types';

/**
 * What a beaten chakra beast leaves for the pot (`EnemyDef.drops`), and the dishes made from
 * it (`docs/design/chakra-beasts-plan.md`). Nobody sells these: you bring them out of the wild
 * yourself. Each dish does a job another already does and adds a second one, as a dish that
 * costs a hunt should (`cooking-plan.md`, rule 3). They are in a book sold at home, and can be
 * worked out at the stove.
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
      'The meat is warm before it goes near the fire, and still warm an hour after you eat it.',
    icon: 'pot',
    rank: 'B',
    method: 'grill',
    steps: { cut: 'chunky' },
    ingredients: [
      { id: 'ember-boar-flank', count: 1 },
      { id: 'spices', count: 1 },
    ],
    satiety: 40,
    energy: 10,
    chakra: 30,
    buff: { hungerRate: 0.9 },
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
      'Lean, dark meat stewed all afternoon with roots. It tastes of the mountain herbs the serow eats.',
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
    buff: { studyElement: { earth: 1.25 }, growth: { stamina: 1.1 } },
  },
  {
    id: 'moss-bear-broth',
    name: 'Moss Bear Broth',
    description:
      'A spoon of the green fat melted into broth. It smells of moss, and cuts close up overnight.',
    icon: 'bowl',
    rank: 'B',
    method: 'simmer',
    ingredients: [
      { id: 'moss-bear-fat', count: 1 },
      { id: 'vegetables', count: 1 },
    ],
    satiety: 45,
    energy: 10,
    health: 15,
    buff: { injuryNights: 1, sleepHealing: 1.2 },
  },
  {
    id: 'venom-sac-tonic',
    name: 'Venom Sac Tonic',
    description:
      'The sac boiled down with ginger. It burns going down. Scorpion hunters drink it before a night out on the sand.',
    icon: 'bowl',
    rank: 'C',
    method: 'boil',
    ingredients: [
      { id: 'glass-venom-sac', count: 1 },
      { id: 'wild-ginger', count: 1 },
    ],
    satiety: 15,
    energy: 5,
    buff: { afterDark: 1.2 },
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
    buff: { bondGain: 1.25, hungerRate: 0.9 },
  },
];

export const BEAST_COOKBOOK: CookbookDef = {
  id: 'hunters-pot',
  name: 'The Hunter’s Pot',
  description:
    'A notebook kept by someone who went into the deep woods for meat. Some pages are scorched, and one is water-stained.',
  cost: 180,
  icon: 'scroll',
  recipeIds: BEAST_RECIPES.map((r) => r.id),
};
