import type { Find } from '@/systems/cooking';

import type { IngredientDef } from '../types';

/**
 * What the desert gives anyone who knows where to look: dates off the wild palms, prickly pears
 * on the scrub, sage in the wadis, and the truffles that come up after the rare rain, which only
 * a good cook knows for food. There is nothing to fish. Shared by every pack.
 */

export const DESERT_INGREDIENTS: readonly IngredientDef[] = [
  { id: 'wild-dates', name: 'Wild Dates', cost: 12, icon: 'veg' },
  { id: 'prickly-pear', name: 'Prickly Pear', cost: 10, icon: 'veg' },
  { id: 'desert-sage', name: 'Desert Sage', cost: 8, icon: 'leaf' },
  { id: 'desert-truffles', name: 'Desert Truffles', cost: 30, icon: 'veg' },
];

/** The desert: dates and pears in the heat, sage all year, truffles after the spring rain. */
export const DESERT_FINDS: readonly Find[] = [
  { ingredientId: 'wild-dates', weight: 3, seasons: ['Summer', 'Autumn'] },
  { ingredientId: 'prickly-pear', weight: 3, seasons: ['Summer'] },
  { ingredientId: 'desert-sage', weight: 2 },
  { ingredientId: 'desert-truffles', weight: 1, seasons: ['Spring'], minGrade: 'D' },
];
