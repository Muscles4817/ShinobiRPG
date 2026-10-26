import type { LocationDef } from '../../types';
import { DESERT_FINDS } from '../../shared/desert';
import { RIVER_FINDS, RIVER_SPOTS, WOODS_FINDS } from '../../shared/wilds';

/**
 * The country between the fan pack's towns (`docs/design/journeys-plan.md` step 12): the Great
 * Forest on the way to the coast, the Land of Rivers on the way west, the outer sands before the
 * tainted belt, and the landmarks: the Thousand Steps on the temple stair, the Tenchi Bridge over
 * its gorge, and the Valley of the End. None of it is famous: it is heard of on the roads, or
 * found by walking them.
 */

const CAMP_ICON = 'lantern';

export const GREAT_FOREST: LocationDef = {
  id: 'great-forest',
  name: 'The Great Forest',
  kind: 'wild',
  epithet: 'The Land of Fire’s endless trees',
  map: { x: 63, y: 39.5, label: 'right' },
  backdrop: 'broadleaf-forest',
  places: [
    {
      id: 'great-forest-woods',
      kind: 'wilds',
      name: 'Under the Canopy',
      icon: 'tree',
      blurb: 'Trees as wide as houses, and the road a thread between them',
      biome: 'woods',
      finds: WOODS_FINDS,
    },
    {
      id: 'great-forest-camp',
      kind: 'camp',
      name: 'The Outpost Ruins',
      icon: CAMP_ICON,
      blurb: 'A fallen watch post the Leaf’s patrols still sleep in',
    },
  ],
};

export const LAND_OF_RIVERS: LocationDef = {
  id: 'land-of-rivers',
  name: 'The Land of Rivers',
  kind: 'wild',
  epithet: 'Braided water between the Fire and the Wind',
  map: { x: 34, y: 30.5 },
  backdrop: 'river-plain',
  places: [
    {
      id: 'land-of-rivers-banks',
      kind: 'wilds',
      name: 'The Shingle Banks',
      icon: 'wave',
      blurb: 'Shallow channels running over stones, and herons in all of them',
      biome: 'river',
      finds: RIVER_FINDS,
      spots: RIVER_SPOTS,
    },
    {
      id: 'land-of-rivers-camp',
      kind: 'camp',
      name: 'The Ferryman’s Island',
      icon: CAMP_ICON,
      blurb: 'A gravel island with a fire pit and nobody’s name on it',
    },
  ],
};

export const OUTER_SANDS: LocationDef = {
  id: 'outer-sands',
  name: 'The Outer Sands',
  kind: 'wild',
  epithet: 'The dunes before the tainted belt',
  map: { x: 20, y: 47, label: 'right' },
  backdrop: 'outer-dunes',
  places: [
    {
      id: 'outer-sands-hollows',
      kind: 'wilds',
      name: 'The Wind Hollows',
      icon: 'leaf',
      blurb: 'Scrub and thorn in the lee of the big dunes',
      biome: 'desert',
      finds: DESERT_FINDS,
    },
    {
      id: 'outer-sands-camp',
      kind: 'camp',
      name: 'The Rock Arch',
      icon: CAMP_ICON,
      blurb: 'Shade under a stone arch the wind has worn through',
    },
  ],
};

export const THOUSAND_STEPS: LocationDef = {
  id: 'thousand-steps',
  name: 'The Thousand Steps',
  kind: 'landmark',
  epithet: 'Halfway up the temple stair',
  map: { x: 42.5, y: 25, label: 'right' },
  backdrop: 'mountain-stair',
  sight: {
    text: 'Halfway up, the stair turns along the cliff to a shrine no bigger than a cupboard, where pilgrims leave their sandals and climb the rest barefoot. You sit with the monks who sweep it and breathe as they do until your legs stop shaking.',
    reward: { stamina: 1 },
  },
  places: [
    {
      id: 'thousand-steps-camp',
      kind: 'camp',
      name: 'The Sandal Shrine',
      icon: CAMP_ICON,
      blurb: 'A ledge by the little shrine, out of the wind',
    },
  ],
};

export const TENCHI_BRIDGE: LocationDef = {
  id: 'tenchi-bridge',
  name: 'The Tenchi Bridge',
  kind: 'landmark',
  epithet: 'Heaven and earth over the gorge',
  map: { x: 27, y: 25 },
  backdrop: 'gorge-bridge',
  sight: {
    text: 'The bridge hangs across the gorge on ropes as thick as your arm, and the wind sings in them. Halfway over you stop and look down, and pick out every ledge and bird’s nest on the far wall before you go on.',
    reward: { perception: 1 },
  },
  places: [
    {
      id: 'tenchi-bridge-camp',
      kind: 'camp',
      name: 'The Toll Hut',
      icon: CAMP_ICON,
      blurb: 'A keeper’s hut at the bridge-head, long empty',
    },
  ],
};

export const VALLEY_OF_THE_END: LocationDef = {
  id: 'valley-of-the-end',
  name: 'The Valley of the End',
  kind: 'landmark',
  epithet: 'Two founders facing across the falls',
  map: { x: 46, y: 14, label: 'right' },
  backdrop: 'twin-statues',
  sight: {
    text: 'Two stone giants stand on either side of the falls, each with a hand raised in the sign of confrontation, the river pouring down between them. You stand in the spray at the foot of the falls and feel how small a fight between two people ought to be.',
    reward: { willpower: 1 },
  },
  places: [
    {
      id: 'valley-of-the-end-camp',
      kind: 'camp',
      name: 'The Statue’s Foot',
      icon: CAMP_ICON,
      blurb: 'A dry ledge at the foot of the stone giant',
    },
  ],
};

export const NARUTO_WILD_COUNTRY: readonly LocationDef[] = [
  GREAT_FOREST,
  LAND_OF_RIVERS,
  OUTER_SANDS,
  THOUSAND_STEPS,
  TENCHI_BRIDGE,
  VALLEY_OF_THE_END,
];
