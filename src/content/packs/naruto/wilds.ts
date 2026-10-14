import type { PlaceDef } from '../../types';
import { RIVER_FINDS, RIVER_SPOTS, WOODS_FINDS } from '../../shared/wilds';

/** Konoha's wild places: the forest past the training grounds and the Naka River. */
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
];
