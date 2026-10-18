import type { IngredientDef } from '../types';

/**
 * Everything that takes a line, a net or a hand in the water, in every pack: rivers, mountain
 * water, the marsh and the shore (`waters.ts` says where and when each bites). Each has a
 * `length` for the field book, and most a `family`, so recipes that take any white fish or any
 * shellfish can use it. A few (octopus, squid, puffer, turtle) are their own thing and only
 * their own dishes take them.
 */

const RIVER: readonly IngredientDef[] = [
  {
    id: 'sweetfish',
    name: 'Sweetfish',
    cost: 18,
    icon: 'fish',
    length: [14, 28],
    family: 'freshwater',
  },
  { id: 'dace', name: 'Dace', cost: 10, icon: 'fish', length: [12, 30], family: 'freshwater' },
  { id: 'carp', name: 'Carp', cost: 22, icon: 'fish', length: [30, 80], family: 'freshwater' },
  {
    id: 'golden-carp',
    name: 'Golden Carp',
    cost: 60,
    icon: 'fish',
    length: [35, 90],
    family: 'freshwater',
  },
  { id: 'river-eel', name: 'River Eel', cost: 30, icon: 'fish', length: [40, 95], family: 'oily' },
  {
    id: 'crayfish',
    name: 'Crayfish',
    cost: 12,
    icon: 'fish',
    length: [7, 15],
    family: 'shellfish',
  },
  {
    id: 'river-crab',
    name: 'River Crab',
    cost: 14,
    icon: 'fish',
    length: [4, 10],
    family: 'shellfish',
  },
  // Rare: the field book's fish page is not full without them.
  {
    id: 'old-catfish',
    name: 'Old Whiskers Catfish',
    cost: 45,
    icon: 'fish',
    length: [60, 140],
    family: 'white',
  },
];

const MOUNTAIN: readonly IngredientDef[] = [
  {
    id: 'mountain-trout',
    name: 'Mountain Trout',
    cost: 26,
    icon: 'fish',
    length: [24, 48],
    family: 'freshwater',
  },
  {
    id: 'mountain-char',
    name: 'Mountain Char',
    cost: 24,
    icon: 'fish',
    length: [20, 40],
    family: 'freshwater',
  },
  {
    id: 'cherry-salmon',
    name: 'Cherry Salmon',
    cost: 34,
    icon: 'fish',
    length: [30, 60],
    family: 'freshwater',
  },
];

const MARSH: readonly IngredientDef[] = [
  { id: 'loach', name: 'Loach', cost: 8, icon: 'fish', length: [8, 18], family: 'freshwater' },
  {
    id: 'pond-smelt',
    name: 'Pond Smelt',
    cost: 9,
    icon: 'fish',
    length: [6, 14],
    family: 'freshwater',
  },
  {
    id: 'pond-snail',
    name: 'Pond Snails',
    cost: 6,
    icon: 'fish',
    length: [2, 5],
    family: 'shellfish',
  },
  { id: 'softshell-turtle', name: 'Softshell Turtle', cost: 40, icon: 'fish', length: [20, 40] },
];

const SHORE: readonly IngredientDef[] = [
  { id: 'sea-bream', name: 'Sea Bream', cost: 24, icon: 'fish', length: [25, 50], family: 'white' },
  { id: 'rockfish', name: 'Rockfish', cost: 16, icon: 'fish', length: [15, 35], family: 'white' },
  { id: 'flounder', name: 'Flounder', cost: 20, icon: 'fish', length: [20, 50], family: 'white' },
  {
    id: 'horse-mackerel',
    name: 'Horse Mackerel',
    cost: 12,
    icon: 'fish',
    length: [15, 35],
    family: 'oily',
  },
  { id: 'sardine', name: 'Sardines', cost: 8, icon: 'fish', length: [10, 22], family: 'oily' },
  {
    id: 'yellowtail',
    name: 'Winter Yellowtail',
    cost: 40,
    icon: 'fish',
    length: [50, 100],
    family: 'oily',
  },
  {
    id: 'conger-eel',
    name: 'Conger Eel',
    cost: 38,
    icon: 'fish',
    length: [50, 130],
    family: 'oily',
  },
  { id: 'clams', name: 'Clams', cost: 16, icon: 'fish', length: [3, 7], family: 'shellfish' },
  {
    id: 'turban-shell',
    name: 'Turban Shell',
    cost: 18,
    icon: 'fish',
    length: [6, 12],
    family: 'shellfish',
  },
  {
    id: 'sea-urchin',
    name: 'Sea Urchin',
    cost: 28,
    icon: 'fish',
    length: [5, 10],
    family: 'shellfish',
  },
  { id: 'octopus', name: 'Octopus', cost: 24, icon: 'fish', length: [30, 90] },
  { id: 'spear-squid', name: 'Spear Squid', cost: 18, icon: 'fish', length: [15, 40] },
  // Poison in the liver: only a cook of grade C or better is trusted with one.
  { id: 'puffer', name: 'Puffer Fish', cost: 50, icon: 'fish', length: [15, 40] },
];

export const FISH: readonly IngredientDef[] = [...RIVER, ...MOUNTAIN, ...MARSH, ...SHORE];
