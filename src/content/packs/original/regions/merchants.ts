import type { Stall } from '../../../types';

/**
 * Travelling merchants from the places around the village: the Shiomachi fish cart (the port
 * sells the same at its own market), the dune caravan and a pilgrim herbalist down from Mount
 * Reikon. Each sets up on Market Street every few days with its home's larder and a cookbook
 * of its dishes (shared, `shared/regionalRecipes.ts`). The cart's bream and clams are the shore's own (`shared/fish.ts`).
 */

export const TRAVELLING_STALLS: readonly Stall[] = [
  {
    name: 'The Shiomachi Fish Cart',
    blurb: 'Down from the port on ice, once a week',
    icon: 'fish',
    hours: ['morning', 'afternoon'],
    visits: { every: 7, on: 2 },
    foodIds: [],
    ingredientIds: ['sea-bream', 'clams', 'kelp'],
    cookbookIds: ['recipes-from-the-port'],
  },
  {
    name: 'The Dune Caravan',
    blurb: 'Camels in the square and spice in the air',
    icon: 'cart',
    hours: ['morning', 'afternoon', 'evening'],
    visits: { every: 12, on: 5 },
    foodIds: [],
    ingredientIds: ['dates', 'dune-spices'],
    cookbookIds: ['caravan-cook'],
  },
  {
    name: 'A Pilgrim Herbalist',
    blurb: 'A monk from Mount Reikon with a basket of strange things',
    icon: 'leaf',
    hours: ['morning'],
    visits: { every: 14, on: 9 },
    foodIds: [],
    ingredientIds: ['mountain-herbs', 'chakra-fruit'],
    cookbookIds: ['pilgrims-bowl'],
  },
];
