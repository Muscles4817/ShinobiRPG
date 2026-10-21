import type { FoodDef } from '../../../types';

/** What the Landing sells a traveller about to cross the sand, and one coming back from it. */
export const LANDING_FOODS: readonly FoodDef[] = [
  {
    id: 'well-water',
    name: 'A Cup of Well Water',
    icon: 'tea',
    description: 'Cold from the deep well. In the Landing it costs more than tea does elsewhere.',
    cost: 8,
    satiety: 5,
    energy: 10,
    slots: 0,
  },
  {
    id: 'date-cakes',
    name: 'Date Cakes',
    icon: 'dango',
    description: 'Dates pounded with sesame and pressed into cakes that keep for a whole crossing.',
    cost: 20,
    satiety: 25,
    energy: 10,
    slots: 0,
  },
  {
    id: 'camel-milk-tea',
    name: 'Camel-Milk Tea',
    icon: 'tea',
    description:
      'Black tea boiled with camel’s milk and salt. The caravan men drink it by the pot.',
    cost: 15,
    satiety: 15,
    energy: 10,
    slots: 0,
  },
];
