import type { FoodDef } from './types';

export const FOODS: readonly FoodDef[] = [
  {
    id: 'rice-ball',
    name: 'Rice Ball',
    description: 'Wrapped in seaweed, eaten on the run.',
    cost: 15,
    satiety: 20,
    energy: 0,
    slots: 0,
  },
  {
    id: 'grilled-fish',
    name: 'Grilled River Fish',
    description: 'Salted and charred over the stall’s coals.',
    cost: 30,
    satiety: 35,
    energy: 0,
    slots: 0,
  },
  {
    id: 'ember-noodles',
    name: 'Ember Noodles',
    description: 'A fiery broth the whole village swears by.',
    cost: 45,
    satiety: 50,
    energy: 5,
    slots: 0,
  },
  {
    id: 'soldier-pill',
    name: 'Soldier Pill',
    description: 'Bitter, chalky, and it makes your heart race.',
    cost: 40,
    satiety: 10,
    energy: 30,
    slots: 0,
  },
  {
    id: 'teahouse-feast',
    name: 'Teahouse Feast',
    description: 'A long, unhurried meal by the lantern canal.',
    cost: 90,
    satiety: 80,
    energy: 20,
    slots: 1,
  },
];
