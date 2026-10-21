import type { FoodDef } from '../../../types';

/** The Outer Ring's food: spice from the caravans, bread from the clay ovens, and water dear. */
export const SUNA_FOODS: readonly FoodDef[] = [
  {
    id: 'spiced-lamb-skewers',
    name: 'Spiced Lamb Skewers',
    icon: 'grill',
    description: 'Lamb rubbed with cumin and chilli and turned over coals until it chars.',
    cost: 35,
    satiety: 35,
    energy: 10,
    slots: 0,
  },
  {
    id: 'sand-flatbread',
    name: 'Ember Flatbread',
    icon: 'rice',
    description: 'Dough slapped on the inside of a clay oven and peeled off blistered.',
    cost: 15,
    satiety: 25,
    energy: 5,
    slots: 0,
  },
  {
    id: 'mint-tea',
    name: 'Mint Tea',
    icon: 'tea',
    description: 'Sweet green tea with a fistful of mint, poured from a height so it froths.',
    cost: 12,
    satiety: 5,
    energy: 15,
    slots: 0,
  },
];
