import type { PlaceDef } from '../../types';
import { MARSH_FINDS, MARSH_SPOTS, MOUNTAIN_FINDS, MOUNTAIN_SPOTS } from '../../shared/waters';
import { RIVER_FINDS, RIVER_SPOTS, WOODS_FINDS } from '../../shared/wilds';

/**
 * Konoha's wild places: the forest past the training grounds, the Naka River, the falls on
 * the cliff behind the village and the paddies outside the gate.
 */
export const KONOHA_WILDS: readonly PlaceDef[] = [
  {
    id: 'konoha-forest',
    kind: 'wilds',
    name: 'The Village Forest',
    icon: 'tree',
    blurb: 'Endless trees past the training grounds',
    biome: 'woods',
    finds: WOODS_FINDS,
  },
  {
    id: 'naka-river',
    kind: 'wilds',
    name: 'Naka River',
    icon: 'wave',
    blurb: 'The river that runs through the village',
    biome: 'river',
    finds: RIVER_FINDS,
    spots: RIVER_SPOTS,
  },
  {
    id: 'cliff-falls',
    kind: 'wilds',
    name: 'The Falls Under the Cliff',
    icon: 'wave',
    blurb: 'A cold stream dropping off the cliff behind the village',
    biome: 'mountain',
    finds: MOUNTAIN_FINDS,
    spots: MOUNTAIN_SPOTS,
  },
  {
    id: 'konoha-paddies',
    kind: 'wilds',
    name: 'The Paddies Past the Gate',
    icon: 'leaf',
    blurb: 'Flooded fields and ditches along the road out',
    biome: 'marsh',
    finds: MARSH_FINDS,
    spots: MARSH_SPOTS,
  },
];
