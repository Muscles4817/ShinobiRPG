import type { RouteDef } from '@/systems/travel';

import type { LocationDef } from '../../types';

/**
 * The hidden villages beyond the Leaf's neighbours, not yet places to go: the Cloud across the
 * strait, the Stone in the mountains of Earth, the Rain under Hanzō, the Waterfall behind its
 * falls and the samurai's Land of Iron. They are on the map, and the home of versus fighters
 * (`homeLocationId`); their roads leave from the Valley of the End and the Tenchi Bridge, and
 * none passes through them while they are locked.
 */
const COMING_SOON = 'Coming soon';

export const FAR_VILLAGES: readonly LocationDef[] = [
  {
    id: 'kumogakure',
    name: 'Kumogakure',
    kind: 'village',
    famous: true,
    epithet: 'Village Hidden in the Clouds',
    map: { x: 82, y: 8, label: 'left' },
    backdrop: 'mountain',
    places: [],
    lockedReason: COMING_SOON,
  },
  {
    id: 'iwagakure',
    name: 'Iwagakure',
    kind: 'village',
    famous: true,
    epithet: 'Village Hidden by Stones',
    map: { x: 14, y: 13 },
    backdrop: 'mountain-stair',
    places: [],
    lockedReason: COMING_SOON,
  },
  {
    id: 'amegakure',
    name: 'Amegakure',
    kind: 'village',
    epithet: 'Village Hidden by Rain',
    map: { x: 22, y: 23.5, label: 'right' },
    backdrop: 'castle-town',
    places: [],
    lockedReason: COMING_SOON,
  },
  {
    id: 'takigakure',
    name: 'Takigakure',
    kind: 'village',
    epithet: 'Village Hidden by a Waterfall',
    map: { x: 38, y: 10, label: 'left' },
    backdrop: 'waterfall',
    places: [],
    lockedReason: COMING_SOON,
  },
  {
    id: 'land-of-iron',
    name: 'The Land of Iron',
    kind: 'town',
    epithet: 'Where the samurai keep out of shinobi wars',
    map: { x: 47, y: 4, label: 'right' },
    backdrop: 'mountain',
    places: [],
    lockedReason: COMING_SOON,
  },
];

/** A road to each, long and dangerous, from the edge of the country the Leaf knows. */
export const FAR_VILLAGE_ROUTES: readonly RouteDef[] = [
  {
    id: 'cloud-crossing',
    from: 'valley-of-the-end',
    to: 'kumogakure',
    legs: [
      {
        region: 'hill-road',
        days: 2,
        text: 'North-east through the Land of Hot Water, its springs steaming beside the road.',
      },
      {
        region: 'coast-road',
        days: 2,
        text: 'Along the coast to a fishing port, and a boat across the strait to the Land of Lightning.',
      },
      {
        region: 'mountain-pass',
        days: 2,
        text: 'Up through the peaks, where the cloud sits on the road and the village is built into the rock.',
      },
    ],
    trail: [
      { x: 56, y: 10 },
      { x: 66, y: 6 },
      { x: 74, y: 8 },
    ],
    danger: 'deadly',
    cost: 120,
  },
  {
    id: 'stone-road',
    from: 'tenchi-bridge',
    to: 'iwagakure',
    legs: [
      {
        region: 'hill-road',
        days: 2,
        text: 'North across the Land of Grass, where the Stone and the Leaf fought their last war.',
      },
      {
        region: 'mountain-pass',
        days: 3,
        text: 'Into the bare rock of the mountains of Earth, where the village is carved into the cliffs.',
      },
    ],
    trail: [{ x: 22, y: 19 }],
    danger: 'deadly',
  },
  {
    id: 'rain-road',
    from: 'tenchi-bridge',
    to: 'amegakure',
    legs: [
      {
        region: 'river-road',
        days: 2,
        text: 'West into the Land of Rain, under a sky that never clears, towards towers of pipes and iron.',
      },
    ],
    danger: 'deadly',
  },
  {
    id: 'waterfall-path',
    from: 'valley-of-the-end',
    to: 'takigakure',
    legs: [
      {
        region: 'river-road',
        days: 2,
        text: 'Upriver into the Land of Waterfalls, to a village only reached through the falls themselves.',
      },
    ],
    trail: [{ x: 42, y: 12 }],
    danger: 'armed',
  },
  {
    id: 'iron-pass',
    from: 'valley-of-the-end',
    to: 'land-of-iron',
    legs: [
      {
        region: 'mountain-pass',
        days: 3,
        text: 'North into the snow, where samurai watch the passes and no shinobi crosses without leave.',
      },
    ],
    trail: [{ x: 47, y: 9 }],
    danger: 'armed',
  },
];
