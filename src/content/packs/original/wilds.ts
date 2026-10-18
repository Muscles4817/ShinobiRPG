import type { PlaceDef } from '../../types';
import { MARSH_FINDS, MARSH_SPOTS, MOUNTAIN_FINDS, MOUNTAIN_SPOTS } from '../../shared/waters';
import { RIVER_FINDS, RIVER_SPOTS, WOODS_FINDS } from '../../shared/wilds';

/**
 * Tōrōgakure's wild places: the woods on the hill, the falls above them, the river below the
 * lantern canal and the paddy marsh downstream.
 */
export const TOROGAKURE_WILDS: readonly PlaceDef[] = [
  {
    id: 'lantern-woods',
    kind: 'wilds',
    name: 'Lantern Woods',
    icon: 'tree',
    blurb: 'Cedar and bamboo on the hill above the village',
    biome: 'woods',
    finds: WOODS_FINDS,
  },
  {
    id: 'canal-river',
    kind: 'wilds',
    name: 'The River Below the Canal',
    icon: 'wave',
    blurb: 'Where the lantern canal spills into the river',
    biome: 'river',
    finds: RIVER_FINDS,
    spots: RIVER_SPOTS,
  },
  {
    id: 'cedar-falls',
    kind: 'wilds',
    name: 'Cedar Falls',
    icon: 'wave',
    blurb: 'Where the river comes off the hill, cold and loud',
    biome: 'mountain',
    finds: MOUNTAIN_FINDS,
    spots: MOUNTAIN_SPOTS,
  },
  {
    id: 'paddy-marsh',
    kind: 'wilds',
    name: 'The Paddy Marsh',
    icon: 'leaf',
    blurb: 'Rice fields and reed beds where the river spreads out',
    biome: 'marsh',
    finds: MARSH_FINDS,
    spots: MARSH_SPOTS,
  },
];
