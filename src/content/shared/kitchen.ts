import type { IngredientDef, RecipeDef } from '../types';

/** Everyday ingredients and home cooking. Shared by every pack: rice is rice everywhere. */
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

const ALL_DISCIPLINES_10 = {
  taijutsu: 1.1,
  ninjutsu: 1.1,
  genjutsu: 1.1,
  kenjutsu: 1.1,
  fuuinjutsu: 1.1,
};

const ALL_DISCIPLINES_15 = {
  taijutsu: 1.15,
  ninjutsu: 1.15,
  genjutsu: 1.15,
  kenjutsu: 1.15,
  fuuinjutsu: 1.15,
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
  {
    id: 'egg-over-rice',
    name: 'Egg over Rice',
    description: 'A raw egg beaten into hot rice with a splash of soy. Breakfast in a minute.',
    icon: 'rice',
    ingredients: [
      { id: 'rice', count: 1 },
      { id: 'eggs', count: 1 },
    ],
    satiety: 40,
    energy: 10,
    buff: { hungerRate: 0.85 },
  },
  {
    id: 'simmered-tofu',
    name: 'Simmered Tofu',
    description: 'Soft tofu warmed through in miso and greens. Calm food for a careful day.',
    icon: 'pot',
    ingredients: [
      { id: 'tofu', count: 1 },
      { id: 'miso', count: 1 },
      { id: 'vegetables', count: 1 },
    ],
    satiety: 40,
    energy: 15,
    buff: { growth: { chakraControl: 1.15, willpower: 1.15 } },
  },
  {
    id: 'bamboo-rice',
    name: 'Spring Bamboo Rice',
    description: 'Rice cooked with the season’s first shoots. It tastes of new beginnings.',
    icon: 'rice',
    ingredients: [
      { id: 'rice', count: 1 },
      { id: 'bamboo-shoots', count: 1 },
    ],
    satiety: 50,
    energy: 15,
    buff: { studyDiscipline: ALL_DISCIPLINES_15 },
  },
  {
    id: 'cucumber-rice',
    name: 'Chilled Cucumber Rice',
    description: 'Cucumber ribbons and a pinch of chilli over rice cooled in the well bucket.',
    icon: 'bowl',
    ingredients: [
      { id: 'cucumbers', count: 1 },
      { id: 'rice', count: 1 },
      { id: 'spices', count: 1 },
    ],
    satiety: 40,
    energy: 25,
    buff: { growth: { speed: 1.15, stamina: 1.1 } },
  },
  {
    id: 'chestnut-rice',
    name: 'Chestnut Rice',
    description: 'Sticky rice studded with peeled chestnuts. Heavy, sweet, and gone too soon.',
    icon: 'rice',
    ingredients: [
      { id: 'rice', count: 1 },
      { id: 'chestnuts', count: 1 },
    ],
    satiety: 60,
    energy: 10,
    buff: { training: 1.15 },
  },
  {
    id: 'radish-stew',
    name: 'Winter Radish Stew',
    description: 'Thick rounds of radish simmered all afternoon with miso and tofu.',
    icon: 'pot',
    ingredients: [
      { id: 'winter-radish', count: 1 },
      { id: 'miso', count: 1 },
      { id: 'tofu', count: 1 },
    ],
    satiety: 65,
    energy: 20,
    buff: { training: 1.1, hungerRate: 0.8 },
  },
];
