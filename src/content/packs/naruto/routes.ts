import type { RouteDef } from '@/systems/travel';

/**
 * The roads out of the Leaf: south-east to the Land of Waves and across the water to the Mist,
 * west through the hills to the desert, down the highway to Shukuba and Tanzaku, east to the
 * pleasure quarter, up to the Fire Temple, and the long way to the toads.
 */
export const NARUTO_ROUTES: readonly RouteDef[] = [
  {
    id: 'waves-road',
    from: 'konohagakure',
    to: 'land-of-waves',
    legs: [
      {
        region: 'forest-track',
        days: 1,
        text: 'The road runs under the forest canopy, past the outposts at the edge of the Leaf’s land.',
      },
      {
        region: 'coast-road',
        days: 1,
        text: 'The road leaves the trees for the coast, where fishing boats lie drawn up on the sand.',
      },
    ],
    trail: [
      { x: 56, y: 34 },
      { x: 63, y: 40 },
      { x: 68, y: 43.5 },
      { x: 71, y: 44.6 },
      { x: 74.6, y: 45.8 },
    ],
    danger: 'armed',
    cost: 40,
  },
  {
    id: 'mist-crossing',
    from: 'land-of-waves',
    to: 'kirigakure',
    legs: [
      {
        region: 'coast-road',
        days: 2,
        text: 'A boatman takes you over the misty water, saying as little as he can.',
      },
    ],
    trail: [
      { x: 82, y: 43 },
      { x: 87, y: 39 },
    ],
    danger: 'deadly',
    cost: 110,
  },
  {
    id: 'highway-north',
    from: 'konohagakure',
    to: 'shukuba-town',
    legs: [
      {
        region: 'forest-track',
        days: 1,
        text: 'The highway runs south through the Leaf’s forests, busy with carts and pilgrims.',
      },
    ],
    trail: [{ x: 45, y: 31 }],
    danger: 'petty',
  },
  {
    id: 'highway-south',
    from: 'shukuba-town',
    to: 'tanzaku-town',
    legs: [
      {
        region: 'river-road',
        days: 1,
        text: 'The road follows the river down to the plain, and the castle roofs show over the fields.',
      },
    ],
    trail: [{ x: 37, y: 35 }],
    danger: 'petty',
  },
  {
    id: 'quarter-road',
    from: 'konohagakure',
    to: 'otafuku-town',
    legs: [
      {
        region: 'forest-track',
        days: 1,
        text: 'An easy road east under the trees, full of men who say they are travelling on business.',
      },
      {
        region: 'hill-road',
        days: 1,
        text: 'Over the low hills, and at dusk the red lanterns of the quarter light up the valley.',
      },
    ],
    trail: [{ x: 50, y: 33 }],
    danger: 'petty',
  },
  {
    id: 'temple-stair',
    from: 'konohagakure',
    to: 'fire-temple',
    legs: [
      {
        region: 'forest-track',
        days: 1,
        text: 'A pilgrims’ road north-west, with a shrine at every crossing and a prayer at most of them.',
      },
      {
        region: 'mountain-pass',
        days: 1,
        text: 'The road becomes a stair, and the stair goes on into the clouds. A bell sounds somewhere above.',
      },
    ],
    trail: [{ x: 43, y: 25 }],
    danger: 'petty',
  },
  {
    id: 'desert-road',
    from: 'konohagakure',
    to: 'sunagakure',
    legs: [
      {
        region: 'hill-road',
        days: 1,
        text: 'The road crosses dry hills between the forest and the desert.',
      },
      {
        region: 'dune-road',
        days: 2,
        text: 'Sand, and more sand. You walk at dawn and dusk, and shelter from the noon sun.',
      },
    ],
    trail: [
      { x: 36, y: 30 },
      { x: 26, y: 38 },
      { x: 18, y: 46 },
    ],
    danger: 'armed',
    cost: 120,
  },
  {
    id: 'toad-path',
    from: 'konohagakure',
    to: 'mount-myoboku',
    legs: [
      {
        region: 'forest-track',
        days: 2,
        text: 'An old path leads off the map, deeper into the forest than anyone sensible goes.',
      },
      {
        region: 'mountain-pass',
        days: 3,
        text: 'The path climbs among wet rocks and strange, huge plants. Toads watch you from the ledges.',
      },
    ],
    trail: [{ x: 55, y: 25 }],
    danger: 'deadly',
  },
];
