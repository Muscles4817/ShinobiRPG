import type { CookbookDef, IngredientDef } from '../../types';

/** Tōrōgakure's own larder: what its grocer and tea shop sell beyond the everyday staples. */
export const TOROGAKURE_INGREDIENTS: readonly IngredientDef[] = [
  { id: 'buckwheat', name: 'Buckwheat Noodles', cost: 12, icon: 'bowl' },
  { id: 'sesame', name: 'Sesame Seeds', cost: 10, icon: 'leaf' },
  { id: 'red-beans', name: 'Red Beans', cost: 9, icon: 'bowl' },
  { id: 'tea-leaves', name: 'Canal Tea Leaves', cost: 10, icon: 'tea' },
  { id: 'lotus-root', name: 'Lotus Root', cost: 11, icon: 'veg', seasons: ['Autumn', 'Winter'] },
  { id: 'pickled-plums', name: 'Pickled Plums', cost: 8, icon: 'bowl', road: 15 },
];

/** The village's own cookbook, sold at Sato's Grocery. */
export const TOROGAKURE_COOKBOOKS: readonly CookbookDef[] = [
  {
    id: 'lantern-village-kitchen',
    name: 'The Lantern Village Kitchen',
    description: 'Every household in Tōrōgakure has this book, and every one has argued with it.',
    cost: 90,
    icon: 'scroll',
    recipeIds: ['lantern-soba', 'plum-rice-balls', 'sesame-tofu', 'black-sesame-soup'],
  },
];
