import type { TechniqueDef } from '@/systems/techniques';

/**
 * Techniques people fight with but never teach (their `arsenal`): the Copy Ninja's own
 * lightning and the water arts he copied.
 */
export const ARSENAL_TECHNIQUES: readonly TechniqueDef[] = [
  {
    id: 'lightning-hound',
    name: 'Lightning Style: Lightning Hound',
    description: 'The Lightning Blade let off the leash: a hound of lightning runs down the arm.',
    discipline: 'ninjutsu',
    element: 'lightning',
    reach: ['close', 'mid'],
    accuracy: 'sure',
    effects: [
      { verb: 'damage', power: 20 },
      { verb: 'daze', power: 6 },
    ],
    chakraCost: 16,
    rank: 'B',
    needs: { nature: 'lightning' },
    difficulty: 110,
  },
  {
    id: 'lightning-beast-running',
    name: 'Lightning Beast Running',
    description: 'A beast of crackling chakra bounds across the field and bites at a distance.',
    discipline: 'ninjutsu',
    element: 'lightning',
    accuracy: 'sure',
    effects: [{ verb: 'damage', power: 17 }],
    chakraCost: 12,
    rank: 'B',
    needs: { nature: 'lightning' },
    difficulty: 95,
  },
  {
    id: 'lightning-clone',
    name: 'Lightning Style: Shadow Clone',
    description: 'A clone made of lightning. Strike it and the shock runs up your arm.',
    discipline: 'ninjutsu',
    element: 'lightning',
    effects: [
      { verb: 'clone', power: 8, strikes: true },
      { verb: 'counter', power: 10 },
    ],
    chakraCost: 18,
    rank: 'B',
    needs: { nature: 'lightning', minReserves: 12 },
    difficulty: 115,
  },
  {
    id: 'water-wall',
    name: 'Water Style: Water Wall',
    description: 'Water spun up from the mouth into a turning wall that swallows the attack.',
    discipline: 'ninjutsu',
    element: 'water',
    effects: [{ verb: 'substitute', power: 12 }],
    chakraCost: 12,
    rank: 'B',
    needs: { nature: 'water' },
    difficulty: 90,
  },
  {
    id: 'great-waterfall',
    name: 'Water Style: Great Waterfall',
    description:
      'The lake stands up and comes down on the whole field, copied a beat before it was cast.',
    discipline: 'ninjutsu',
    element: 'water',
    effects: [
      { verb: 'area', power: 18 },
      { verb: 'knock', power: 8, to: 'far' },
    ],
    chakraCost: 20,
    rank: 'B',
    needs: { nature: 'water' },
    difficulty: 120,
  },
];
