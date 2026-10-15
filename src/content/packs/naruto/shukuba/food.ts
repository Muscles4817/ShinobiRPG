import type { FoodDef } from '../../../types';

/** What the post town feeds people who are leaving in the morning. */
export const SHUKUBA_FOODS: readonly FoodDef[] = [
  {
    id: 'post-town-soba',
    name: 'Post-Town Soba',
    icon: 'bowl',
    description:
      'Served in a minute, eaten in two. The broth is better than it has any right to be.',
    cost: 25,
    satiety: 35,
    energy: 5,
    slots: 0,
  },
];
