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
    danger: 'deadly',
    cost: 110,
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
    danger: 'deadly',
  },
];
