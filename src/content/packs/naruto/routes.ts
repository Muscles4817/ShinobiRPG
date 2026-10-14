import type { RouteDef } from '@/systems/travel';

/**
 * The roads out of the Leaf: south-east to the Land of Waves and across the water to the Mist,
 * west through the hills to the desert, and the long way to the toads.
 */
export const NARUTO_ROUTES: readonly RouteDef[] = [
  {
    id: 'waves-road',
    from: 'konohagakure',
    to: 'land-of-waves',
    legs: [
      { region: 'forest-track', days: 1 },
      { region: 'coast-road', days: 1 },
    ],
    danger: 'armed',
    cost: 40,
  },
  {
    id: 'mist-crossing',
    from: 'land-of-waves',
    to: 'kirigakure',
    legs: [{ region: 'coast-road', days: 2 }],
    danger: 'deadly',
    cost: 110,
  },
  {
    id: 'desert-road',
    from: 'konohagakure',
    to: 'sunagakure',
    legs: [
      { region: 'hill-road', days: 1 },
      { region: 'dune-road', days: 2 },
    ],
    danger: 'armed',
    cost: 120,
  },
  {
    id: 'toad-path',
    from: 'konohagakure',
    to: 'mount-myoboku',
    legs: [
      { region: 'forest-track', days: 2 },
      { region: 'mountain-pass', days: 3 },
    ],
    danger: 'deadly',
  },
];
