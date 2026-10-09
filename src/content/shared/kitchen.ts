import type { IngredientDef, RecipeDef } from '../types';

/** Everyday ingredients and home cooking. Shared by every pack: rice is rice everywhere. */
export const INGREDIENTS: readonly IngredientDef[] = [
  { id: 'rice', name: 'Rice', cost: 8, icon: 'rice' },
  { id: 'river-fish', name: 'River Fish', cost: 14, icon: 'fish' },
  { id: 'vegetables', name: 'Vegetables', cost: 10, icon: 'veg' },
  { id: 'miso', name: 'Miso', cost: 9, icon: 'bowl' },
  { id: 'spices', name: 'Spices', cost: 12, icon: 'leaf' },
];

const ALL_DISCIPLINES_10 = {
  taijutsu: 1.1,
  ninjutsu: 1.1,
  genjutsu: 1.1,
  kenjutsu: 1.1,
  fuuinjutsu: 1.1,
};

export const RECIPES: readonly RecipeDef[] = [
  {
    id: 'rice-ball-bento',
    name: 'Rice Ball Bento',
    description: 'Two rice balls wrapped for the road. Filling, plain, reliable.',
    icon: 'rice',
    ingredients: [{ id: 'rice', count: 2 }],
    satiety: 40,
    energy: 5,
    buff: { hungerRate: 0.8 },
  },
  {
    id: 'miso-soup',
    name: 'Miso Soup',
    description: 'A warm bowl that clears the head before a day of scrolls.',
    icon: 'bowl',
    ingredients: [
      { id: 'miso', count: 1 },
      { id: 'vegetables', count: 1 },
    ],
    satiety: 30,
    energy: 15,
    buff: { studyDiscipline: ALL_DISCIPLINES_10 },
  },
  {
    id: 'grilled-fish-set',
    name: 'Grilled Fish Set',
    description: 'Fish, rice and pickles. What every sensei tells you to eat.',
    icon: 'fish',
    ingredients: [
      { id: 'river-fish', count: 1 },
      { id: 'rice', count: 1 },
      { id: 'vegetables', count: 1 },
    ],
    satiety: 65,
    energy: 10,
    buff: { training: 1.1 },
  },
  {
    id: 'spicy-hot-pot',
    name: 'Spicy Hot Pot',
    description: 'Everything in one pot, with enough chilli to wake the dead.',
    icon: 'pot',
    ingredients: [
      { id: 'river-fish', count: 1 },
      { id: 'vegetables', count: 1 },
      { id: 'miso', count: 1 },
      { id: 'spices', count: 1 },
    ],
    satiety: 75,
    energy: 20,
    buff: { training: 1.15, hungerRate: 0.9 },
  },
];
