import type { Find } from '@/systems/cooking';

import type { FishingSpot } from '../types';

/**
 * The waters beyond the river, shared by every pack: the shore, the marsh and mountain water,
 * each with what grows at its edge and the spots to fish. A pack's `wilds` places name them.
 * Rare catches sit behind an hour, a season and a cooking grade, so the field book's fish page
 * takes a year and a good hand to fill.
 */

/** Along the tideline: weed on the rocks in the cold months, sea lettuce all year. */
export const SHORE_FINDS: readonly Find[] = [
  { ingredientId: 'rock-laver', weight: 3, seasons: ['Winter', 'Spring'] },
  { ingredientId: 'sea-lettuce', weight: 2 },
];

/** Three places to fish on any shore: the breakwater, the rock pools and the sand. */
export const SHORE_SPOTS: readonly FishingSpot[] = [
  {
    id: 'breakwater-end',
    name: 'The end of the breakwater',
    description:
      'Deep water off the last stones. Shoals run past by day; long things hunt at night.',
    catches: [
      { ingredientId: 'horse-mackerel', weight: 3, slots: ['morning', 'afternoon', 'evening'] },
      { ingredientId: 'sardine', weight: 3, seasons: ['Summer', 'Autumn'] },
      { ingredientId: 'spear-squid', weight: 2, seasons: ['Winter', 'Spring'], slots: ['night'] },
      { ingredientId: 'conger-eel', weight: 1, slots: ['night'], minGrade: 'C' },
      {
        ingredientId: 'yellowtail',
        weight: 1,
        seasons: ['Winter'],
        slots: ['morning'],
        minGrade: 'C',
      },
    ],
  },
  {
    id: 'rock-pools',
    name: 'The rock pools',
    description: 'Weed, shells and things that hide. You fish here as much with a hand as a line.',
    catches: [
      { ingredientId: 'rockfish', weight: 3 },
      { ingredientId: 'turban-shell', weight: 2, slots: ['morning', 'afternoon'] },
      { ingredientId: 'octopus', weight: 2, slots: ['evening', 'night'], minGrade: 'D' },
      { ingredientId: 'sea-urchin', weight: 1, seasons: ['Winter', 'Spring'], minGrade: 'D' },
      {
        ingredientId: 'puffer',
        weight: 1,
        seasons: ['Summer', 'Autumn'],
        slots: ['evening'],
        minGrade: 'C',
      },
    ],
  },
  {
    id: 'sand-flats',
    name: 'The sand at low tide',
    description: 'Wet sand for a mile when the sea goes out. Dig, or cast past the first wave.',
    catches: [
      { ingredientId: 'clams', weight: 3, slots: ['morning', 'afternoon'] },
      { ingredientId: 'flounder', weight: 2 },
      {
        ingredientId: 'sea-bream',
        weight: 1,
        seasons: ['Spring', 'Summer'],
        slots: ['morning'],
      },
    ],
  },
];

/** Paddy banks and wet ground: dropwort in the cold, water chestnuts when the ponds drop. */
export const MARSH_FINDS: readonly Find[] = [
  { ingredientId: 'water-dropwort', weight: 3, seasons: ['Winter', 'Spring'] },
  { ingredientId: 'water-chestnuts', weight: 2, seasons: ['Autumn'] },
  { ingredientId: 'watercress', weight: 1, seasons: ['Spring', 'Autumn', 'Winter'] },
];

/** Two places to fish in the marsh: the paddy ditches and the reed beds. */
export const MARSH_SPOTS: readonly FishingSpot[] = [
  {
    id: 'paddy-ditches',
    name: 'The paddy ditches',
    description: 'Narrow, muddy channels between the fields. A net does better than a hook.',
    catches: [
      { ingredientId: 'loach', weight: 3, seasons: ['Spring', 'Summer', 'Autumn'] },
      { ingredientId: 'pond-snail', weight: 2, seasons: ['Spring', 'Summer'] },
      { ingredientId: 'crayfish', weight: 1, seasons: ['Summer', 'Autumn'] },
    ],
  },
  {
    id: 'reed-beds',
    name: 'The reed beds',
    description: 'Still black water among the reeds. In winter you fish through a hole in the ice.',
    catches: [
      { ingredientId: 'pond-smelt', weight: 3, seasons: ['Winter', 'Spring'] },
      { ingredientId: 'carp', weight: 1 },
      {
        ingredientId: 'softshell-turtle',
        weight: 1,
        seasons: ['Summer'],
        slots: ['night'],
        minGrade: 'C',
      },
    ],
  },
];

/** Steep woods by cold water: butterbur in spring, yam dug in the cold, mushrooms in autumn. */
export const MOUNTAIN_FINDS: readonly Find[] = [
  { ingredientId: 'butterbur', weight: 3, seasons: ['Spring'] },
  { ingredientId: 'mountain-yam', weight: 2, seasons: ['Autumn', 'Winter'] },
  { ingredientId: 'wild-mushrooms', weight: 2, seasons: ['Autumn'] },
  { ingredientId: 'wild-ginger', weight: 1, minGrade: 'D' },
];

/** Two places to fish in mountain water: the plunge pool and the riffles. */
export const MOUNTAIN_SPOTS: readonly FishingSpot[] = [
  {
    id: 'plunge-pool',
    name: 'The plunge pool',
    description:
      'Cold, deep water under the falls. The fish are wary and the spray is in your eyes.',
    catches: [
      { ingredientId: 'mountain-char', weight: 3 },
      { ingredientId: 'mountain-trout', weight: 2, minGrade: 'D' },
    ],
  },
  {
    id: 'riffles',
    name: 'The riffles',
    description: 'Fast water over stones below the pool. In spring the salmon come up through it.',
    catches: [
      { ingredientId: 'dace', weight: 2 },
      { ingredientId: 'mountain-trout', weight: 2, slots: ['morning', 'evening'] },
      {
        ingredientId: 'cherry-salmon',
        weight: 2,
        seasons: ['Spring'],
        slots: ['morning'],
        minGrade: 'D',
      },
    ],
  },
];
