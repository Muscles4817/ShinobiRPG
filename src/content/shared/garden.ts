import type { GardenCrop } from '../homes';

/** What a garden bed grows, setting-neutral: kitchen ingredients, each in its seasons. */
export const GARDEN_CROPS: readonly GardenCrop[] = [
  { ingredientId: 'vegetables', days: 3, seasons: ['Spring', 'Summer', 'Autumn'], seedCost: 4 },
  { ingredientId: 'spices', days: 5, seasons: ['Summer', 'Autumn'], seedCost: 6 },
  { ingredientId: 'cucumbers', days: 4, seasons: ['Summer'], seedCost: 3 },
  { ingredientId: 'bamboo-shoots', days: 4, seasons: ['Spring'], seedCost: 5 },
  { ingredientId: 'winter-radish', days: 5, seasons: ['Autumn', 'Winter'], seedCost: 4 },
];
