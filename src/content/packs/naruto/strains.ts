import type { StrainDef } from '../../strains';

/** The fan pack's hive strains: the Aburame's own kikaichū. */
export const STRAINS: readonly StrainDef[] = [
  {
    id: 'kikaichu',
    name: 'Kikaichū',
    description:
      'The Aburame’s destruction bugs, tiny black things always hungry for chakra. Bred in the body for generations, they are hardier than any wild kind.',
    drain: 1,
    hardiness: 0.3,
    fears: ['fire'],
    senses: 0.6,
  },
];
