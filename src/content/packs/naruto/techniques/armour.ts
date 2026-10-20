import type { TechniqueDef } from '@/systems/techniques';

/**
 * Cast armour (the `shroud` verb) beyond the Cloud's lightning: the Stone's hardening, which
 * stands up to blows and blades and splits under lightning.
 */
export const LEAF_CAST_ARMOUR: readonly TechniqueDef[] = [
  {
    id: 'earth-spear',
    name: 'Earth Style: Earth Spear',
    description: 'The body hardens to stone, hard enough to turn a blade.',
    discipline: 'ninjutsu',
    element: 'earth',
    needs: { nature: 'earth' },
    effects: [{ verb: 'shroud', power: 12, kind: 'earth' }],
    chakraCost: 12,
    rank: 'B',
    difficulty: 105,
  },
];
