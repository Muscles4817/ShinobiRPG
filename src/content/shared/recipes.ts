import type { RecipeDef } from '../types';

/**
 * Home cooking shared by every pack. Each dish has one job (its role) and at most one more:
 * filling for long, tireless, studious, hearty, focused, attuned, restful, healing, mending,
 * chakra-warming, convivial or sharp-eyed. A better dish does a different job, not the same
 * one bigger. The three starters are what everyone knows; the rest are learned (cookbooks in
 * `kitchen.ts`, people's `recipes`, a job's `reward.recipeId`).
 */

const ALL_DISCIPLINES_10 = {
  taijutsu: 1.1,
  ninjutsu: 1.1,
  genjutsu: 1.1,
  kenjutsu: 1.1,
  fuuinjutsu: 1.1,
};

const STARTERS: readonly RecipeDef[] = [
  {
    id: 'rice-ball-bento',
    name: 'Rice Ball Bento',
    description: 'Two rice balls wrapped for the road. Filling, plain, reliable.',
    icon: 'rice',
    rank: 'E',
    starter: true,
    ingredients: [{ id: 'rice', count: 2 }],
    satiety: 40,
    energy: 5,
    buff: { hungerRate: 0.8 },
  },
  {
    id: 'egg-over-rice',
    name: 'Egg over Rice',
    description: 'A raw egg beaten into hot rice with a splash of soy. Breakfast in a minute.',
    icon: 'rice',
    rank: 'E',
    starter: true,
    ingredients: [
      { id: 'rice', count: 1 },
      { id: 'eggs', count: 1 },
    ],
    satiety: 35,
    energy: 20,
    buff: { energyCost: 0.9 },
  },
  {
    id: 'miso-soup',
    name: 'Miso Soup',
    description: 'A warm bowl that clears the head before a day of scrolls.',
    icon: 'bowl',
    rank: 'E',
    starter: true,
    ingredients: [
      { id: 'miso', count: 1 },
      { id: 'vegetables', count: 1 },
    ],
    satiety: 30,
    energy: 15,
    buff: { studyDiscipline: ALL_DISCIPLINES_10 },
  },
];

const EVERYDAY: readonly RecipeDef[] = [
  {
    id: 'grilled-fish-set',
    name: 'Grilled Fish Set',
    description: 'Fish, rice and pickles. What every sensei tells you to eat.',
    icon: 'fish',
    rank: 'D',
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
    id: 'simmered-tofu',
    name: 'Simmered Tofu',
    description: 'Soft tofu warmed through in miso and greens. Calm food for a careful day.',
    icon: 'pot',
    rank: 'D',
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
    id: 'fish-bone-broth',
    name: 'Fish-Bone Broth',
    description: 'The bones and head simmered for hours. It mends what a bandage only covers.',
    icon: 'bowl',
    rank: 'D',
    ingredients: [
      { id: 'river-fish', count: 1 },
      { id: 'vegetables', count: 1 },
    ],
    satiety: 30,
    energy: 5,
    health: 20,
    buff: { sleepHealing: 1.15 },
  },
];

const SEASONS: readonly RecipeDef[] = [
  {
    id: 'bamboo-rice',
    name: 'Spring Bamboo Rice',
    description:
      'Rice cooked with the season’s first shoots. It tastes of wind and new beginnings.',
    icon: 'rice',
    rank: 'D',
    ingredients: [
      { id: 'rice', count: 1 },
      { id: 'bamboo-shoots', count: 1 },
    ],
    satiety: 50,
    energy: 15,
    buff: { studyElement: { wind: 1.25 } },
  },
  {
    id: 'cucumber-rice',
    name: 'Chilled Cucumber Rice',
    description: 'Cucumber ribbons and a pinch of chilli over rice cooled in the well bucket.',
    icon: 'bowl',
    rank: 'D',
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
    description:
      'Sticky rice studded with peeled chestnuts. Heavy, sweet, and the best sleep of the year.',
    icon: 'rice',
    rank: 'D',
    ingredients: [
      { id: 'rice', count: 1 },
      { id: 'chestnuts', count: 1 },
    ],
    satiety: 60,
    energy: 10,
    buff: { sleepHealing: 1.3 },
  },
  {
    id: 'radish-stew',
    name: 'Winter Radish Stew',
    description: 'Thick rounds of radish simmered all afternoon. Old medics swear it knits bone.',
    icon: 'pot',
    rank: 'D',
    ingredients: [
      { id: 'winter-radish', count: 1 },
      { id: 'miso', count: 1 },
      { id: 'tofu', count: 1 },
    ],
    satiety: 65,
    energy: 10,
    health: 10,
    buff: { injuryNights: 1 },
  },
];

const ROAD: readonly RecipeDef[] = [
  {
    id: 'hunters-skewers',
    name: 'Hunter’s Skewers',
    description: 'Fish rubbed with pepper and charred on green sticks. You eat quietly and listen.',
    icon: 'fish',
    rank: 'C',
    ingredients: [
      { id: 'river-fish', count: 1 },
      { id: 'spices', count: 1 },
    ],
    satiety: 35,
    energy: 10,
    buff: { checks: { perception: 1.15, speed: 1.1 } },
  },
  {
    id: 'tofu-congee',
    name: 'Tofu Congee',
    description: 'Rice cooked down to silk with tofu. It settles the chakra like a deep breath.',
    icon: 'bowl',
    rank: 'D',
    ingredients: [
      { id: 'rice', count: 1 },
      { id: 'tofu', count: 1 },
    ],
    satiety: 40,
    energy: 5,
    chakra: 20,
    buff: { hungerRate: 0.9 },
  },
];

/** Taught by people who cook for a living, once they like you (`PersonDef.recipes`). */
const TAUGHT: readonly RecipeDef[] = [
  {
    id: 'rolled-omelette',
    name: 'Rolled Omelette Box',
    description: 'Sweet egg rolled in thin layers and sliced for sharing. Nobody eats it alone.',
    icon: 'bowl',
    rank: 'D',
    ingredients: [
      { id: 'eggs', count: 2 },
      { id: 'rice', count: 1 },
    ],
    satiety: 40,
    energy: 10,
    buff: { bondGain: 1.25 },
  },
  {
    id: 'spicy-hot-pot',
    name: 'Spicy Hot Pot',
    description: 'Everything in one pot, with enough chilli to wake the dead.',
    icon: 'pot',
    rank: 'C',
    ingredients: [
      { id: 'river-fish', count: 1 },
      { id: 'vegetables', count: 1 },
      { id: 'miso', count: 1 },
      { id: 'spices', count: 1 },
    ],
    satiety: 75,
    energy: 20,
    buff: { growth: { strength: 1.2, stamina: 1.2 }, energyCost: 0.9 },
  },
  {
    id: 'pepper-rice',
    name: 'Ember Pepper Rice',
    description:
      'Rice fried with dried chilli until the pan smokes. Fire users eat it by the bowl.',
    icon: 'rice',
    rank: 'D',
    ingredients: [
      { id: 'rice', count: 1 },
      { id: 'spices', count: 1 },
    ],
    satiety: 45,
    energy: 10,
    buff: { studyElement: { fire: 1.25 } },
  },
];

export const RECIPES: readonly RecipeDef[] = [
  ...STARTERS,
  ...EVERYDAY,
  ...SEASONS,
  ...ROAD,
  ...TAUGHT,
];
