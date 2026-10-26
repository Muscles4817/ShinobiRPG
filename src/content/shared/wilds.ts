import type { Find } from '@/systems/cooking';

import type { FishingSpot, IngredientDef } from '../types';
import { FISH } from './fish';

/**
 * What grows and swims outside every village: wild ingredients (never sold, only gathered), and
 * the finds and fishing spots a pack's woods and rivers offer. Shared by every pack; a pack's
 * `wilds` places name them.
 */

export const WILD_INGREDIENTS: readonly IngredientDef[] = [
  { id: 'wild-mushrooms', name: 'Wild Mushrooms', cost: 14, icon: 'leaf' },
  { id: 'mountain-greens', name: 'Mountain Greens', cost: 8, icon: 'leaf' },
  { id: 'wild-ginger', name: 'Wild Ginger', cost: 20, icon: 'leaf' },
  { id: 'watercress', name: 'Watercress', cost: 8, icon: 'leaf' },
  // Only from a beast you've beaten (`EnemyDef.drops`).
  { id: 'wild-game', name: 'Wild Game', cost: 25, icon: 'pot' },
  // The shore, the marsh and mountain water (`waters.ts`).
  { id: 'rock-laver', name: 'Rock Laver', cost: 12, icon: 'leaf' },
  { id: 'sea-lettuce', name: 'Sea Lettuce', cost: 8, icon: 'leaf' },
  { id: 'water-dropwort', name: 'Water Dropwort', cost: 10, icon: 'leaf' },
  { id: 'water-chestnuts', name: 'Water Chestnuts', cost: 14, icon: 'veg' },
  { id: 'butterbur', name: 'Butterbur Shoots', cost: 12, icon: 'leaf' },
  { id: 'mountain-yam', name: 'Mountain Yam', cost: 18, icon: 'veg' },
  ...FISH,
];

/** The woods: greens in the warm months, mushrooms and chestnuts in autumn, ginger if you know it. */
export const WOODS_FINDS: readonly Find[] = [
  { ingredientId: 'mountain-greens', weight: 4, seasons: ['Spring', 'Summer'] },
  { ingredientId: 'bamboo-shoots', weight: 3, seasons: ['Spring'] },
  { ingredientId: 'wild-mushrooms', weight: 4, seasons: ['Summer', 'Autumn'] },
  { ingredientId: 'chestnuts', weight: 3, seasons: ['Autumn'] },
  { ingredientId: 'winter-radish', weight: 1, seasons: ['Winter'] },
  { ingredientId: 'wild-ginger', weight: 1, minGrade: 'D' },
];

/** The river bank: watercress at the edges and whatever the current leaves. */
export const RIVER_FINDS: readonly Find[] = [
  { ingredientId: 'watercress', weight: 3, seasons: ['Spring', 'Autumn', 'Winter'] },
  { ingredientId: 'crayfish', weight: 2, seasons: ['Summer', 'Autumn'] },
  { ingredientId: 'mountain-greens', weight: 1, seasons: ['Spring', 'Summer'] },
];

/** Four places to cast on any river: the shallows, the reeds, the deep pool and the weir. */
export const RIVER_SPOTS: readonly FishingSpot[] = [
  {
    id: 'shallows',
    name: 'The shallows',
    description: 'Fast, bright water over stones. Quick fish feed here in daylight.',
    catches: [
      { ingredientId: 'river-fish', weight: 3, slots: ['morning', 'afternoon'] },
      {
        ingredientId: 'sweetfish',
        weight: 3,
        seasons: ['Summer'],
        slots: ['morning', 'afternoon'],
      },
      { ingredientId: 'mountain-trout', weight: 1, seasons: ['Spring'], slots: ['morning'] },
      {
        ingredientId: 'dace',
        weight: 2,
        seasons: ['Spring', 'Autumn', 'Winter'],
        slots: ['morning', 'afternoon'],
      },
    ],
  },
  {
    id: 'reeds',
    name: 'The reeds',
    description: 'Slow water and mud. Things crawl as much as swim here.',
    catches: [
      { ingredientId: 'crayfish', weight: 3, seasons: ['Spring', 'Summer', 'Autumn'] },
      { ingredientId: 'river-fish', weight: 2 },
      {
        ingredientId: 'river-crab',
        weight: 2,
        seasons: ['Summer', 'Autumn'],
        slots: ['evening', 'night'],
      },
    ],
  },
  {
    id: 'deep-pool',
    name: 'The deep pool',
    description: 'Black water under the willows. Whatever lives here comes up after dark.',
    catches: [
      { ingredientId: 'river-eel', weight: 2, slots: ['evening', 'night'], minGrade: 'D' },
      { ingredientId: 'river-fish', weight: 1, slots: ['evening', 'night'] },
      {
        ingredientId: 'old-catfish',
        weight: 1,
        seasons: ['Autumn', 'Winter'],
        slots: ['night'],
        minGrade: 'C',
      },
    ],
  },
  {
    id: 'weir',
    name: 'The weir',
    description: 'Where an old fish weir breaks the current. Big fish wait in the eddy below it.',
    catches: [
      { ingredientId: 'carp', weight: 3 },
      { ingredientId: 'river-fish', weight: 2 },
      {
        ingredientId: 'golden-carp',
        weight: 1,
        seasons: ['Summer'],
        slots: ['evening'],
        minGrade: 'C',
      },
    ],
  },
];

/** Around any camp on the road: what a quick look along the verge and the stream turns up. */
export const CAMP_FINDS: readonly Find[] = [
  { ingredientId: 'mountain-greens', weight: 3, seasons: ['Spring', 'Summer'] },
  { ingredientId: 'wild-mushrooms', weight: 3, seasons: ['Summer', 'Autumn'] },
  { ingredientId: 'chestnuts', weight: 2, seasons: ['Autumn'] },
  { ingredientId: 'watercress', weight: 2, seasons: ['Spring', 'Autumn', 'Winter'] },
  { ingredientId: 'river-fish', weight: 2 },
  { ingredientId: 'wild-ginger', weight: 1, minGrade: 'D' },
];
