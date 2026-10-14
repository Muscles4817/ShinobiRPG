import type { FoodDef } from '../../../types';

/** What the river sells at the ford. */
export const KIRI_FORD_FOODS: readonly FoodDef[] = [
  {
    id: 'river-eel-skewer',
    icon: 'grill',
    name: 'River Eel Skewer',
    description: 'Grilled on the deck of the boat that caught it, and brushed with sweet sauce.',
    cost: 35,
    satiety: 35,
    energy: 5,
    slots: 0,
  },
];
