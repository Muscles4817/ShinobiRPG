import type { TrainingDef } from '../../../types';

/** Drills at the edge of the sand: in the barge yards and out on the heat flats. */
export const LANDING_TRAINING: readonly TrainingDef[] = [
  {
    id: 'ballast-hauling',
    icon: 'cart',
    name: 'Ballast Hauling',
    spot: 'The loading ramps in the barge yards',
    description:
      'Carry stones up the ramps to the barges, since nobody in town will do it for the priests.',
    slots: 1,
    energyCost: 25,
    gains: { strength: 1.1, stamina: 0.8 },
  },
  {
    id: 'reading-the-dunes',
    icon: 'eye',
    name: 'Reading the Dunes',
    spot: 'The top of the tallest dune by the yards',
    description:
      'Sit where the pilots sit and learn to see which way the sand is moving under the wind.',
    slots: 1,
    energyCost: 15,
    gains: { perception: 1.1, intellect: 0.6 },
  },
  {
    id: 'heat-shimmer-drill',
    icon: 'eye',
    name: 'Heat Shimmer',
    spot: 'The middle of the flats at noon',
    description:
      'Throw at targets you can only see through the shimmer, and learn which ones are there.',
    slots: 1,
    energyCost: 20,
    gains: { perception: 0.9, kenjutsu: 0.6, willpower: 0.5 },
  },
  {
    id: 'sand-running',
    icon: 'wind',
    name: 'Sand Running',
    spot: 'The soft sand beyond the flats',
    description: 'Sprint where every step sinks, until you learn to land light.',
    slots: 1,
    energyCost: 25,
    gains: { speed: 1, chakraControl: 0.6 },
  },
];
