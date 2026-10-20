import type { FoodDef } from '../../../types';

/** The harbour ward's food: whatever comes in through the fog, eaten close to the water. */
export const KIRI_FOODS: readonly FoodDef[] = [
  {
    id: 'auction-sashimi',
    name: 'Auction-Floor Sashimi',
    icon: 'fish',
    description: 'Cut on the auction floor from the fish nobody bid high enough for.',
    cost: 35,
    satiety: 30,
    energy: 10,
    slots: 0,
  },
  {
    id: 'salted-squid',
    name: 'Salted Squid',
    icon: 'grill',
    description:
      'Dried on the quay rails and grilled until it curls. Chewy enough to last a watch.',
    cost: 20,
    satiety: 20,
    energy: 5,
    slots: 0,
  },
  {
    id: 'mist-hot-pot',
    name: 'Net-Menders’ Hot Pot',
    icon: 'pot',
    description:
      'Fish heads and kelp, with whatever else went in this morning. Hot enough to beat the fog.',
    cost: 30,
    satiety: 40,
    energy: 5,
    slots: 0,
  },
  {
    id: 'kelp-tea',
    name: 'Kelp Tea',
    icon: 'tea',
    description: 'Salty and green. The fishermen swear it keeps the cold out of their chests.',
    cost: 10,
    satiety: 5,
    energy: 10,
    slots: 0,
  },
  {
    id: 'whale-bacon',
    name: 'Whale Bacon',
    icon: 'grill',
    description: 'Striped red and white, sliced thin off the flensing table and eaten standing up.',
    cost: 40,
    satiety: 35,
    energy: 10,
    slots: 0,
  },
  {
    id: 'whale-broth',
    name: 'Whale-Bone Broth',
    icon: 'bowl',
    description:
      'Boiled all night from the bones before they go to the graves. The whalers say grace over it.',
    cost: 25,
    satiety: 30,
    energy: 5,
    slots: 0,
  },
];
