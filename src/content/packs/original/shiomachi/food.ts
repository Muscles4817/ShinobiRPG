import type { FoodDef, IngredientDef, RecipeDef } from '../../../types';

/** What the coast eats, and what it dries for the road. */
export const SHIOMACHI_FOODS: readonly FoodDef[] = [
  {
    id: 'harbour-sashimi',
    icon: 'fish',
    name: 'Harbour Sashimi',
    description: 'Sliced off the morning’s catch while it still looks surprised.',
    cost: 50,
    satiety: 40,
    energy: 5,
    slots: 0,
  },
  {
    id: 'grilled-squid',
    icon: 'grill',
    name: 'Grilled Squid',
    description: 'Brushed with soy and blackened at the edges. Chewy, in a good way.',
    cost: 25,
    satiety: 25,
    energy: 0,
    slots: 0,
  },
  {
    id: 'harbour-clam-soup',
    icon: 'bowl',
    name: 'Harbour Clam Soup',
    description: 'Little clams opening in a cloudy broth. Warms you to the toes.',
    cost: 30,
    satiety: 30,
    energy: 5,
    slots: 0,
  },
  {
    id: 'fishermans-stew',
    icon: 'pot',
    name: 'Fisherman’s Stew',
    description: 'Whatever didn’t sell, boiled with kelp and a lot of pepper.',
    cost: 40,
    satiety: 55,
    energy: 0,
    slots: 0,
  },
  {
    id: 'jetty-eel',
    icon: 'grill',
    name: 'Jetty Eel',
    description: 'Eel grilled on the jetty while the paper boats drift out. Only the one night.',
    cost: 45,
    satiety: 45,
    energy: 10,
    slots: 0,
  },
];

/**
 * Sold at the drying racks: dried fish keeps on the road better than the village’s rations.
 * The port's fresh fish, clams and kelp are the regional larder (`regions/merchants.ts`).
 */
export const SHIOMACHI_INGREDIENTS: readonly IngredientDef[] = [
  { id: 'dried-fish', name: 'Dried Fish', cost: 15, icon: 'fish', road: 30 },
  { id: 'sea-salt', name: 'Sea Salt', cost: 5, icon: 'rice' },
];

/** Cooked at home from what the coast sells. */
export const SHIOMACHI_RECIPES: readonly RecipeDef[] = [
  {
    id: 'kelp-fish-broth',
    name: 'Kelp and Dried Fish Broth',
    description: 'Simmered slow, salted at the end. It keeps a body going through a cold watch.',
    icon: 'pot',
    rank: 'D',
    method: 'simmer',
    ingredients: [
      { id: 'dried-fish', count: 1 },
      { id: 'kelp', count: 1 },
      { id: 'sea-salt', count: 1 },
    ],
    satiety: 60,
    energy: 15,
    buff: { hungerRate: 0.85 },
  },
];
