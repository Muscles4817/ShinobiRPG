import type { StrainDef } from '../../strains';

/** The fan pack's hive strains: the Aburame's own kikaichū. */
export const STRAINS: readonly StrainDef[] = [
  {
    id: 'kikaichu',
    name: 'Kikaichū',
    description:
      'The Aburame’s destruction bugs, tiny black things always hungry for chakra. Bred in the body for generations, they drain like nothing else alive.',
    species: 'kikaichū beetle',
    family: 'beetle',
    qualities: { speed: 'C', bite: 'D', toughness: 'C', brood: 'C', size: 'B', senses: 'C' },
    gifts: { drain: 3 },
    fears: ['fire'],
  },
];
