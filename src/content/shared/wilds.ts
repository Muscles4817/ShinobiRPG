import type { Find } from '@/systems/cooking';

import type { FishingSpot, IngredientDef } from '../types';

/**
 * What grows and swims outside every village: wild ingredients (never sold, only gathered), and
 * the finds and fishing spots a pack's woods and rivers offer. Shared by every pack; a pack's
 * `wilds` places name them.
 */

export const WILD_INGREDIENTS: readonly IngredientDef[] = [
  { id: 'wild-mushrooms', name: 'Wild Mushrooms', cost: 14, icon: 'leaf' },
  { id: 'mountain-greens', name: 'Mountain Greens', cost: 8, icon: 'leaf' },
  { id: 'wild-ginger', name: 'Wild Ginger', cost: 20, icon: 'leaf' },
  { id: 'sweetfish', name: 'Sweetfish', cost: 18, icon: 'fish' },
  { id: 'river-eel', name: 'River Eel', cost: 30, icon: 'fish' },
  { id: 'crayfish', name: 'Crayfish', cost: 12, icon: 'fish' },
  { id: 'watercress', name: 'Watercress', cost: 8, icon: 'leaf' },
  // Only from a beast you've beaten (`EnemyDef.drops`).
  { id: 'wild-game', name: 'Wild Game', cost: 25, icon: 'pot' },
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

/** Three places to cast on any river: the shallows, the reeds and the deep pool. */
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
    ],
  },
  {
    id: 'reeds',
    name: 'The reeds',
    description: 'Slow water and mud. Things crawl as much as swim here.',
    catches: [
      { ingredientId: 'crayfish', weight: 3, seasons: ['Spring', 'Summer', 'Autumn'] },
      { ingredientId: 'river-fish', weight: 2 },
    ],
  },
  {
    id: 'deep-pool',
    name: 'The deep pool',
    description: 'Black water under the willows. Whatever lives here comes up after dark.',
    catches: [
      { ingredientId: 'river-eel', weight: 2, slots: ['evening', 'night'], minGrade: 'D' },
      { ingredientId: 'river-fish', weight: 1, slots: ['evening', 'night'] },
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
