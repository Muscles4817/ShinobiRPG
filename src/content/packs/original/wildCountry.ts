import type { LocationDef } from '../../types';
import { DESERT_FINDS } from '../../shared/desert';
import { WOODS_FINDS } from '../../shared/wilds';

/**
 * The Land of Embers between its towns (`docs/design/journeys-plan.md` 3.8): the old forest on
 * the track to Kiri Ford, the shrine the tide covers in the bay, the salt flats at the desert's
 * edge, and the landmarks on the pass and off the dune road. None of it is famous: it is heard
 * of on the roads, or found by walking them.
 */

const CAMP_ICON = 'lantern';

export const CEDAR_DEEP: LocationDef = {
  id: 'cedar-deep',
  name: 'The Cedar Deep',
  kind: 'wild',
  epithet: 'The old forest on the Kiri track',
  map: { x: 56, y: 33 },
  backdrop: 'cedar-forest',
  places: [
    {
      id: 'cedar-deep-woods',
      kind: 'wilds',
      name: 'Under the Cedars',
      icon: 'tree',
      blurb: 'Trees older than the village, and moss to the knee',
      biome: 'woods',
      finds: WOODS_FINDS,
    },
    {
      id: 'cedar-deep-camp',
      kind: 'camp',
      name: 'The Hermit’s Clearing',
      icon: CAMP_ICON,
      blurb: 'A ring of stones by an empty hut, where travellers sleep',
    },
  ],
};

export const DROWNED_SHRINE: LocationDef = {
  id: 'drowned-shrine',
  name: 'The Drowned Shrine',
  kind: 'landmark',
  epithet: 'Twice a day the tide covers it',
  map: { x: 24, y: 61, label: 'right' },
  backdrop: 'tide-shrine',
  sight: {
    text: 'At low water the shrine stands up out of the bay, weed on its gate and fish in its basin. You stand under the gate as the tide comes back in, and keep your feet on the water as it rises round you.',
    reward: { chakraControl: 1 },
  },
  places: [
    {
      id: 'drowned-shrine-ledge',
      kind: 'camp',
      name: 'The High Step',
      icon: CAMP_ICON,
      blurb: 'The one step the tide never reaches',
    },
  ],
};

export const HANEBASHI: LocationDef = {
  id: 'hanebashi',
  name: 'Hanebashi',
  kind: 'town',
  epithet: 'The post town below the pass',
  map: { x: 44, y: 24 },
  backdrop: 'post-town',
  places: [
    {
      id: 'hanebashi-inn',
      kind: 'inn',
      name: 'The Feather Bridge Inn',
      icon: 'house',
      blurb: 'Pilgrims’ sandals in rows at the door, and a fire that never goes out',
      keeper: 'Old Sen, who has walked the pass forty times',
      roomCost: 30,
    },
    {
      id: 'hanebashi-outfitter',
      kind: 'gear',
      name: 'Pass Outfitters',
      icon: 'vest',
      blurb: 'Coats and charms for the cold up the pass',
      hours: ['morning', 'afternoon', 'evening'],
      keeper: 'Kiku, who will tell you you need a warmer coat',
      gearIds: ['padded-jacket', 'lantern-charm', 'hawk-talisman'],
    },
  ],
};

export const LANTERNFALL: LocationDef = {
  id: 'lanternfall',
  name: 'Lanternfall',
  kind: 'landmark',
  epithet: 'Where the old lanterns were washed',
  map: { x: 39, y: 17, label: 'left' },
  backdrop: 'waterfall',
  sight: {
    text: 'The fall comes off the cliff in one white rope. Under it the rocks are worn into bowls, where the village once brought its lanterns to be washed before the spirits’ festival. You sit by the pool until you can hear nothing but the water.',
    reward: { willpower: 1 },
  },
  places: [
    {
      id: 'lanternfall-camp',
      kind: 'camp',
      name: 'The Washing Stones',
      icon: CAMP_ICON,
      blurb: 'Flat rocks by the pool, out of the spray',
    },
  ],
};

export const SALT_FLATS: LocationDef = {
  id: 'salt-flats',
  name: 'The Salt Flats',
  kind: 'wild',
  epithet: 'The desert’s white edge',
  map: { x: 76, y: 36 },
  backdrop: 'salt-flats',
  places: [
    {
      id: 'salt-flats-scrub',
      kind: 'wilds',
      name: 'The Scrub by the Wells',
      icon: 'leaf',
      blurb: 'Thorn and date palms round the last sweet wells',
      biome: 'desert',
      finds: DESERT_FINDS,
    },
    {
      id: 'salt-flats-camp',
      kind: 'camp',
      name: 'The Caravan Camp',
      icon: CAMP_ICON,
      blurb: 'A wall of salt blocks the caravans sleep behind',
    },
  ],
};

export const OLD_BATTLEFIELD: LocationDef = {
  id: 'old-battlefield',
  name: 'The Old Battlefield',
  kind: 'landmark',
  epithet: 'A grave field off the dune road',
  map: { x: 82, y: 44 },
  backdrop: 'battlefield',
  sight: {
    text: 'Rusted blades stand in the sand in rows, one for each who fell, and the wind has polished the hilts. You walk the rows and read what you can of the names, and come away knowing more of how a fight goes wrong.',
    reward: { intellect: 1 },
  },
  places: [
    {
      id: 'old-battlefield-camp',
      kind: 'camp',
      name: 'The Keeper’s Fire',
      icon: CAMP_ICON,
      blurb: 'A fire someone keeps lit at the field’s edge',
    },
  ],
};

export const WILD_COUNTRY: readonly LocationDef[] = [
  CEDAR_DEEP,
  DROWNED_SHRINE,
  HANEBASHI,
  LANTERNFALL,
  SALT_FLATS,
  OLD_BATTLEFIELD,
];
