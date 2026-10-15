import type { FoodDef } from '../../../types';

/** What Tanzaku eats standing up between games. */
export const TANZAKU_FOODS: readonly FoodDef[] = [
  {
    id: 'castle-town-gyoza',
    name: 'Castle-Town Gyōza',
    icon: 'grill',
    description: 'Crisp on the bottom, a plate of six. Gamblers say an even number is lucky.',
    cost: 30,
    satiety: 30,
    energy: 5,
    slots: 0,
  },
];
