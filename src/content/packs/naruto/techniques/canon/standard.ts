import type { TechniqueDef } from '@/systems/techniques';

/**
 * Canon techniques with no element, school or clan, shelved for anyone: the academy's E–D rack
 * and the Archives' C–B stacks (`shelves.ts`).
 */
export const CANON_STANDARD: readonly TechniqueDef[] = [
  {
    id: 'area-scanning',
    name: 'Area Scanning Technique',
    description: 'A palm on the ground sends chakra through it and feels out everyone nearby.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'sense', power: 14 }],
    chakraCost: 9,
    rank: 'C',
    difficulty: 75,
  },
  {
    id: 'shadow-shuriken',
    name: 'Shadow Shuriken Technique',
    description: 'A second shuriken thrown in the shadow of the first, unseen until it lands.',
    discipline: 'taijutsu',
    reach: ['mid', 'far'],
    accuracy: 'sure',
    effects: [{ verb: 'damage', power: 13 }],
    chakraCost: 5,
    rank: 'D',
    difficulty: 50,
  },
  {
    id: 'flying-revolving-sword',
    name: 'Flying Revolving Sword',
    description: 'A great sword hurled so it spins end over end into the target.',
    discipline: 'kenjutsu',
    reach: ['mid', 'far'],
    accuracy: 'wild',
    needs: { weapon: 'blade' },
    effects: [{ verb: 'damage', power: 22 }],
    chakraCost: 13,
    rank: 'B',
    difficulty: 105,
  },
];
