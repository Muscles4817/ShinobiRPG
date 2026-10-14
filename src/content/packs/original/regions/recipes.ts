import type { RecipeDef } from '../../../types';

/** Dishes from the port, the dunes and the mountain, taught by the merchants' cookbooks. */

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
    description: 'Rice fried golden with dune spice. The Sakyū say it puts sand in your fists.',
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
