import type { RouteDef } from '@/systems/travel';

/**
 * The roads of the Land of Embers. The coast is a day down the hill; the dunes are past Kiri
 * Ford, where the caravans charge for the crossing; the mountain is four days of climbing.
 */
export const ORIGINAL_ROUTES: readonly RouteDef[] = [
  {
    id: 'coast-road',
    from: 'torogakure',
    to: 'port-shiomachi',
    legs: [{ region: 'coast-road', days: 1 }],
    danger: 'petty',
  },
  {
    id: 'ford-track',
    from: 'torogakure',
    to: 'kiri-ford',
    legs: [{ region: 'forest-track', days: 1 }],
    danger: 'armed',
  },
  {
    id: 'dune-crossing',
    from: 'kiri-ford',
    to: 'sakyugakure',
    legs: [{ region: 'dune-road', days: 2 }],
    danger: 'armed',
    cost: 120,
  },
  {
    id: 'reikon-pass',
    from: 'torogakure',
    to: 'mount-reikon',
    legs: [
      { region: 'hill-road', days: 1 },
      { region: 'mountain-pass', days: 3 },
    ],
    danger: 'deadly',
  },
];
