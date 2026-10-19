import type { StrainDef } from '../../strains';

/** The original pack's hive strains: the Tōga's lantern moths. */
export const STRAINS: readonly StrainDef[] = [
  {
    id: 'lantern-moth',
    name: 'Lantern Moths',
    description:
      'Pale moths that gather at the great lanterns. Their dust glows on whatever it touches, and their scales blind.',
    species: 'lantern moth',
    family: 'moth',
    qualities: { speed: 'C', bite: 'E', toughness: 'D', brood: 'D', size: 'D', senses: 'B' },
    gifts: { glow: 2, blinding: 2 },
    fears: ['fire', 'wind'],
  },
];
