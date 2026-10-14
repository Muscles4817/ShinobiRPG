import type { TechniqueDef } from '@/systems/techniques';

/** Canon elemental ninjutsu on the Archives' shelves; the strongest need the nature itself. */
export const CANON_ELEMENTS: readonly TechniqueDef[] = [
  {
    id: 'hiding-like-a-mole',
    name: 'Earth Style: Hiding Like a Mole',
    description: 'The earth softens under you and you tunnel through it like a mole.',
    discipline: 'ninjutsu',
    element: 'earth',
    needs: { nature: 'earth' },
    effects: [
      { verb: 'conceal', power: 12, scaling: { drive: ['ninjutsu'] } },
      { verb: 'move', power: 6 },
    ],
    chakraCost: 10,
    rank: 'C',
    difficulty: 75,
  },
  {
    id: 'water-clone',
    name: 'Water Style: Water Clone',
    description: 'Solid clones of water that fight beside you, weaker than you are.',
    discipline: 'ninjutsu',
    element: 'water',
    needs: { nature: 'water' },
    effects: [{ verb: 'clone', power: 9, strikes: true }],
    chakraCost: 11,
    rank: 'C',
    difficulty: 75,
  },
  {
    id: 'water-shark-bullet',
    name: 'Water Style: Water Shark Bullet',
    description: 'Water hurled in the shape of a shark that rams the target.',
    discipline: 'ninjutsu',
    element: 'water',
    reach: ['close', 'mid'],
    needs: { nature: 'water' },
    effects: [{ verb: 'damage', power: 23 }],
    chakraCost: 16,
    rank: 'B',
    difficulty: 110,
  },
];
