import type { TechniqueDef } from '@/systems/techniques';

/**
 * Combination techniques: each half plays only beside a teammate who knows the other. A
 * teammate knows the half in their specialty.
 */
export const COMBO_TECHNIQUES: readonly TechniqueDef[] = [
  {
    id: 'shrine-snare',
    name: 'Shrine Snare',
    description:
      'A shrine rope thrown low and tied in one breath, so a partner’s blade has something to fall on.',
    discipline: 'fuuinjutsu',
    effects: [
      { verb: 'seal', power: 8 },
      { verb: 'damage', power: 8 },
    ],
    chakraCost: 8,
    requirements: { fuuinjutsu: 8 },
    difficulty: 55,
    combo: { partnerTechniqueId: 'anvil-fall' },
  },
  {
    id: 'anvil-fall',
    name: 'Anvil Fall',
    description: 'The whole blade comes down on whatever the rope is holding, like a hammer.',
    discipline: 'kenjutsu',
    effects: [{ verb: 'damage', power: 18 }],
    chakraCost: 9,
    requirements: { kenjutsu: 8 },
    difficulty: 55,
    combo: { partnerTechniqueId: 'shrine-snare' },
  },
];
