import type { FoodDef } from '../../../types';

/** What a poor fishing town can still sell. */
export const WAVES_FOODS: readonly FoodDef[] = [
  {
    id: 'salt-grilled-mackerel',
    name: 'Salt-Grilled Mackerel',
    icon: 'grill',
    description: 'One fish, grilled over driftwood. The seller apologises for the size.',
    cost: 25,
    satiety: 30,
    energy: 5,
    slots: 0,
  },
  {
    id: 'clam-miso-soup',
    name: 'Clam Miso Soup',
    icon: 'bowl',
    description: 'Dug from the flats at low tide by children, who are paid in soup.',
    cost: 20,
    satiety: 25,
    energy: 0,
    slots: 0,
  },
  {
    id: 'waves-rice-porridge',
    name: 'Thin Rice Porridge',
    icon: 'pot',
    description: 'More water than rice. It is what most of the town eats.',
    cost: 8,
    satiety: 15,
    energy: 0,
    slots: 0,
  },
];
