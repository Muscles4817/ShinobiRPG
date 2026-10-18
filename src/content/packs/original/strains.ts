import type { StrainDef } from '../../strains';

/** The original pack's hive strains: the Tōga's lantern moths. */
export const STRAINS: readonly StrainDef[] = [
  {
    id: 'lantern-moth',
    name: 'Lantern Moths',
    description:
      'Pale moths that gather at the great lanterns. Their dust glows on whatever it touches, and their scales blind. They sip chakra rather than gorge on it.',
    drain: 0.4,
    hardiness: 0.15,
    fears: ['fire', 'wind'],
    senses: 1,
  },
];
