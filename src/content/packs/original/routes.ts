import type { RouteDef } from '@/systems/travel';

/**
 * The roads of the Land of Embers. The coast is a day down the hill; the dunes are past Kiri
 * Ford, where the caravans charge for the crossing; the mountain is four days of climbing.
 * Across the bay from the port to the ford is a day on foot, for whoever can walk on water.
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
    trail: [
      { x: 36, y: 42 },
      { x: 27, y: 49 },
    ],
    danger: 'petty',
  },
  {
    id: 'ford-track',
    from: 'torogakure',
    to: 'cedar-deep',
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
    id: 'cedar-track',
    from: 'cedar-deep',
    to: 'kiri-ford',
    legs: [
      {
        region: 'forest-track',
        days: 1,
        text: 'The cedars thin out towards the river, and the track drops through bamboo to the ford.',
      },
    ],
    danger: 'armed',
  },
  {
    id: 'flats-road',
    from: 'kiri-ford',
    to: 'salt-flats',
    legs: [
      {
        region: 'dune-road',
        days: 1,
        text: 'The river country dries out mile by mile until the ground underfoot is white and crunches.',
      },
    ],
    danger: 'armed',
  },
  {
    id: 'dune-crossing',
    from: 'salt-flats',
    to: 'sakyugakure',
    legs: [
      {
        region: 'dune-road',
        days: 1,
        text: 'Caravan posts mark the way across the dunes, a day apart if the wind is kind.',
      },
    ],
    trail: [{ x: 82, y: 32 }],
    danger: 'armed',
    cost: 120,
  },
  {
    id: 'battlefield-track',
    from: 'salt-flats',
    to: 'old-battlefield',
    legs: [
      {
        region: 'dune-road',
        days: 1,
        text: 'A track nobody keeps leaves the caravan road and runs south over the dunes.',
      },
    ],
    danger: 'armed',
  },
  {
    id: 'hanebashi-road',
    from: 'torogakure',
    to: 'hanebashi',
    legs: [
      {
        region: 'hill-road',
        days: 1,
        text: 'The hill road climbs past shrines whose lanterns nobody tends any more.',
      },
    ],
    danger: 'petty',
  },
  {
    id: 'lanternfall-path',
    from: 'hanebashi',
    to: 'lanternfall',
    legs: [
      {
        region: 'mountain-pass',
        days: 1,
        text: 'Above the post town the road becomes a path, and the sound of falling water grows.',
      },
    ],
    danger: 'deadly',
  },
  {
    id: 'reikon-pass',
    from: 'lanternfall',
    to: 'mount-reikon',
    legs: [
      {
        region: 'mountain-pass',
        days: 2,
        text: 'The pass climbs into cloud. Paper charms hang from the rocks, and something rustles behind them.',
      },
    ],
    danger: 'deadly',
  },
  {
    id: 'bay-crossing',
    name: 'The bay crossing',
    from: 'port-shiomachi',
    to: 'kiri-ford',
    legs: [
      {
        region: 'coast-road',
        days: 2,
        text: 'You walk out across the bay on the swell, gulls overhead and nothing under your feet but chakra and green water.',
      },
    ],
    trail: [
      { x: 33, y: 55 },
      { x: 48, y: 50 },
      { x: 60, y: 44 },
    ],
    danger: 'petty',
    needs: [{ kind: 'walk', surface: 'water' }],
  },
  {
    id: 'tide-path',
    name: 'The tide path',
    from: 'port-shiomachi',
    to: 'drowned-shrine',
    legs: [
      {
        region: 'coast-road',
        days: 1,
        text: 'You walk out from the harbour mouth over open water towards a gate standing in the sea.',
      },
    ],
    danger: 'petty',
    needs: [{ kind: 'walk', surface: 'water' }],
  },
];
