import type { AptitudeDef } from '../../types';

/** Techniques every academy graduate knows. */
export const ACADEMY_TECHNIQUES: readonly string[] = ['shuriken-jutsu', 'clone-jutsu'];

export const APTITUDES: readonly AptitudeDef[] = [
  {
    id: 'taijutsu',
    name: 'Taijutsu Prodigy',
    description:
      'Like Rock Lee, your body learns faster than your chakra. Strong, fast, relentless.',
    statBonuses: { strength: 2, speed: 2, taijutsu: 3 },
    techniqueIds: ['leaf-whirlwind'],
  },
  {
    id: 'ninjutsu',
    name: 'Ninjutsu Prodigy',
    description:
      'Chakra comes easily to you. The hand seals feel like a language you already knew.',
    statBonuses: { chakraControl: 2, intellect: 1, ninjutsu: 3 },
    techniqueIds: ['phoenix-flower'],
  },
  {
    id: 'genjutsu',
    name: 'Genjutsu Prodigy',
    description: 'You see what others miss, and make them see what isn’t there.',
    statBonuses: { perception: 2, willpower: 2, genjutsu: 3 },
    techniqueIds: ['hell-viewing'],
  },
];
