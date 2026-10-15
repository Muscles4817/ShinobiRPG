import type { FoodDef } from '../../../types';

/** Temple food: plain, filling, and good for a body that trains at dawn. */
export const FIRE_TEMPLE_FOODS: readonly FoodDef[] = [
  {
    id: 'temple-vegetable-set',
    name: 'Temple Vegetable Set',
    icon: 'bowl',
    description: 'Rice, pickles, a soup of mountain greens. The monks eat it in silence.',
    cost: 15,
    satiety: 40,
    energy: 5,
    slots: 0,
  },
  {
    id: 'temple-sesame-tofu',
    name: 'Sesame Tofu',
    icon: 'bowl',
    description: 'Ground for an hour by a novice who is learning patience.',
    cost: 20,
    satiety: 20,
    energy: 10,
    slots: 0,
  },
];
