import type { TechniqueDef } from '@/systems/techniques';

/** Canon medical arts that grow out of fine chakra control: Sakura's, taught by her. */
export const CANON_MEDICAL: readonly TechniqueDef[] = [
  {
    id: 'chakra-enhanced-strength',
    name: 'Chakra Enhanced Strength',
    description: 'Chakra held back and let go at the instant of impact, for monstrous strength.',
    discipline: 'taijutsu',
    needs: { control: 'B' },
    effects: [
      {
        verb: 'empower',
        power: 14,
        boosts: ['strength'],
        afterCost: { kind: 'exhaustion', days: 1 },
      },
    ],
    chakraCost: 14,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'chakra-scalpel',
    name: 'Chakra Scalpel',
    description: 'Chakra honed to a fine blade that cuts muscle under unbroken skin.',
    discipline: 'ninjutsu',
    reach: ['close'],
    accuracy: 'sure',
    needs: { control: 'C' },
    effects: [
      { verb: 'damage', power: 12, scaling: { drive: ['ninjutsu', 'chakraControl'] } },
      { verb: 'afflict', power: 7, harm: 'bleed' },
    ],
    chakraCost: 11,
    rank: 'C',
    difficulty: 85,
  },
  {
    id: 'creation-rebirth',
    name: 'Creation Rebirth',
    description: 'A forbidden burst of chakra that forces the body to rebuild itself at once.',
    discipline: 'ninjutsu',
    needs: { control: 'A', minReserves: 20 },
    effects: [{ verb: 'heal', power: 40 }],
    chakraCost: 30,
    rank: 'S',
    difficulty: 170,
    oncePerFight: true,
    afterCost: { kind: 'exhaustion', days: 3 },
  },
  {
    id: 'illness-extraction',
    name: 'Delicate Illness Extraction Technique',
    description: 'Water and chakra drawn through the body pull poison and sickness out with them.',
    discipline: 'ninjutsu',
    needs: { control: 'B' },
    effects: [{ verb: 'heal', power: 18 }],
    chakraCost: 15,
    rank: 'B',
    difficulty: 110,
  },
];
