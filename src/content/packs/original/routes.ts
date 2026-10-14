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
    legs: [
      {
        region: 'coast-road',
        days: 1,
        text: 'The coast road winds down through the terraces, the sea always just past the next bend.',
      },
    ],
    danger: 'petty',
  },
  {
    id: 'ford-track',
    from: 'torogakure',
    to: 'kiri-ford',
    legs: [
      {
        region: 'forest-track',
        days: 1,
        text: 'The track runs under old cedars, and the lanterns of home are soon out of sight.',
      },
    ],
    danger: 'armed',
  },
  {
    id: 'dune-crossing',
    from: 'kiri-ford',
    to: 'sakyugakure',
    legs: [
      {
        region: 'dune-road',
        days: 2,
        text: 'Caravan posts mark the way across the dunes, a day apart if the wind is kind.',
      },
    ],
    danger: 'armed',
    cost: 120,
  },
  {
    id: 'reikon-pass',
    from: 'torogakure',
    to: 'mount-reikon',
    legs: [
      {
        region: 'hill-road',
        days: 1,
        text: 'The hill road climbs past shrines whose lanterns nobody tends any more.',
      },
      {
        region: 'mountain-pass',
        days: 3,
        text: 'The pass climbs into cloud. Paper charms hang from the rocks, and something rustles behind them.',
      },
    ],
    danger: 'deadly',
  },
];
