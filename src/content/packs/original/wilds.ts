import type { PlaceDef } from '../../types';
import { RIVER_FINDS, RIVER_SPOTS, WOODS_FINDS } from '../../shared/wilds';

/** Tōrōgakure's wild places: the woods on the hill and the river below the lantern canal. */
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
];
