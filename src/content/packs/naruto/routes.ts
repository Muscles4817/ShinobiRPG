import type { RouteDef } from '@/systems/travel';

import { SUNA_BARGE_PASSAGE } from './kageroLanding';

/**
 * The roads out of the Leaf: south-east through the Great Forest to the Land of Waves and across
 * the water to the Mist, west through the Land of Rivers (with a track up to the Tenchi Bridge) to
 * Kagerō Landing and over the sand to the Sand (by a priests' barge, or on foot over the outer
 * sands and through the tainted belt), down the highway to Shukuba and Tanzaku, east to the
 * pleasure quarter, up the Thousand Steps to the Fire Temple, north to the Valley of the End,
 * and the long way to the toads.
 */
export const NARUTO_ROUTES: readonly RouteDef[] = [
  {
    id: 'waves-road',
    from: 'konohagakure',
    to: 'great-forest',
    legs: [
      {
        region: 'forest-track',
        days: 1,
        text: 'The road runs under the forest canopy, past the outposts at the edge of the Leaf’s land.',
      },
    ],
    trail: [{ x: 56, y: 34 }],
    danger: 'armed',
  },
  {
    id: 'waves-coast',
    from: 'great-forest',
    to: 'land-of-waves',
    legs: [
      {
        region: 'coast-road',
        days: 1,
        text: 'The road leaves the trees for the coast, where fishing boats lie drawn up on the sand.',
      },
    ],
    trail: [
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
        region: 'mist-sea',
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
    to: 'thousand-steps',
    legs: [
      {
        region: 'forest-track',
        days: 1,
        text: 'A pilgrims’ road north-west, with a shrine at every crossing and a prayer at most of them.',
      },
    ],
    danger: 'petty',
  },
  {
    id: 'temple-climb',
    from: 'thousand-steps',
    to: 'fire-temple',
    legs: [
      {
        region: 'mountain-pass',
        days: 1,
        text: 'The road becomes a stair, and the stair goes on into the clouds. A bell sounds somewhere above.',
      },
    ],
    danger: 'petty',
  },
  {
    id: 'rivers-road',
    from: 'konohagakure',
    to: 'land-of-rivers',
    legs: [
      {
        region: 'hill-road',
        days: 1,
        text: 'The road crosses dry hills between the forest and the Land of Rivers.',
      },
    ],
    trail: [{ x: 41, y: 28.5 }],
    danger: 'petty',
  },
  {
    id: 'rivers-west',
    from: 'land-of-rivers',
    to: 'kagero-landing',
    legs: [
      {
        region: 'river-road',
        days: 1,
        text: 'Through the Land of Rivers, where the rivers thin to stony beds and the sky gets bigger.',
      },
    ],
    trail: [{ x: 28, y: 36 }],
    danger: 'petty',
  },
  {
    id: 'gorge-track',
    from: 'land-of-rivers',
    to: 'tenchi-bridge',
    legs: [
      {
        region: 'hill-road',
        days: 1,
        text: 'A track climbs away from the rivers into broken hills, and the ground drops away into a gorge.',
      },
    ],
    trail: [{ x: 31, y: 28 }],
    danger: 'armed',
  },
  {
    id: 'valley-path',
    from: 'konohagakure',
    to: 'valley-of-the-end',
    legs: [
      {
        region: 'forest-track',
        days: 1,
        text: 'A path north to the border, where the forest grows thin and the ground turns to rock.',
      },
      {
        region: 'river-road',
        days: 1,
        text: 'Along the river through a deep valley, and the roar of the falls ahead long before you see them.',
      },
    ],
    trail: [{ x: 47, y: 21 }],
    danger: 'armed',
  },
  {
    id: 'barge-crossing',
    from: 'kagero-landing',
    to: 'sunagakure',
    name: 'The barge crossing',
    needs: [
      { kind: 'worldMark', mark: SUNA_BARGE_PASSAGE, text: 'a sand priest’s leave to board' },
    ],
    legs: [
      {
        region: 'sand-barge',
        days: 2,
        text: 'A priests’ barge carries you over the dunes, a priest at the helm and the fan clan filling the sail.',
      },
    ],
    trail: [{ x: 17, y: 45 }],
    danger: 'armed',
    cost: 160,
  },
  {
    id: 'outer-sand-walk',
    from: 'kagero-landing',
    to: 'outer-sands',
    legs: [
      {
        region: 'dune-road',
        days: 2,
        text: 'The outer sands. You walk at dawn and dusk, and shelter from the noon sun.',
      },
    ],
    danger: 'armed',
  },
  {
    id: 'deep-sand-walk',
    from: 'outer-sands',
    to: 'sunagakure',
    legs: [
      {
        region: 'tainted-belt',
        days: 2,
        text: 'The tainted belt, where the sand goes grey and glitters, and nothing lives that should.',
      },
    ],
    trail: [{ x: 17, y: 52 }],
    danger: 'deadly',
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
