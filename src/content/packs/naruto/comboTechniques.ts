import type { TechniqueDef } from '@/systems/techniques';

/**
 * Combination techniques: each half plays only beside a teammate who knows the other. A
 * teammate knows the half in their specialty.
 */
export const COMBO_TECHNIQUES: readonly TechniqueDef[] = [
  {
    id: 'gale-palm',
    name: 'Wind Release: Gale Palm',
    description: 'A clap that turns into a gale, carrying a partner’s thrown steel twice as fast.',
    discipline: 'ninjutsu',
    element: 'wind',
    effects: [{ verb: 'damage', power: 10 }],
    chakraCost: 8,
    rank: 'D',
    difficulty: 55,
    combo: { partnerTechniqueId: 'twin-rising-dragons' },
  },
  {
    id: 'twin-rising-dragons',
    name: 'Rising Twin Dragons',
    description: 'Two scrolls unroll into a storm of blades that rides whatever wind it is given.',
    discipline: 'kenjutsu',
    effects: [{ verb: 'damage', power: 18 }],
    chakraCost: 9,
    rank: 'D',
    difficulty: 55,
    combo: { partnerTechniqueId: 'gale-palm' },
  },
];
