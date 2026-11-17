import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { leafFighter } from './fighter';

/**
 * Two Uchiha of the Leaf, both with the Mangekyō: Shisui as he stood before his death, the year
 * of the coup, and Madara alive at the Valley of the End with his brother's eyes (no Rinnegan, no
 * Hashirama's cells, and the Nine-Tails he brought there isn't written). A clan's dormant
 * bloodline gives a person nothing, so their open eyes are perks in the arsenal.
 */
const OPEN_SHARINGAN = ['insight', 'foresight', 'mimicry'] as const;

export const UCHIHA_FIGHTERS: readonly PersonDef[] = [
  leafFighter({
    id: 'shisui',
    name: 'Shisui',
    familyName: 'Uchiha',
    pronouns: 'he',
    title: 'Shisui of the Body Flicker',
    rank: 'jonin',
    // Fast past anyone of his clan in his day, and the strongest illusion there is in his eye.
    stats: statLine(22, {
      genjutsu: 40,
      ninjutsu: 30,
      taijutsu: 28,
      kenjutsu: 24,
      fuuinjutsu: 12,
      chakraControl: 34,
      reserves: 24,
      strength: 14,
      speed: 30,
      stamina: 18,
      intellect: 30,
      perception: 38,
      willpower: 32,
    }),
    clanId: 'uchiha',
    traitIds: ['kind', 'calm'],
    appearance: look(
      'shaggy',
      { hair: '#1b1a22', eyes: '#b8322c', skin: '#f3d2b3', outfit: '#1b1a22' },
      'forehead',
      { shape: 'oval', expression: 'smile', age: 'young' },
    ),
    specialty: 'genjutsu',
    bio: 'Itachi’s closest friend, famed across the nations for the Body Flicker. He meant to stop his clan’s coup with his eye; Danzō took one, and he gave Itachi the other.',
    arsenal: {
      techniqueIds: [
        'kotoamatsukami',
        'coercion-sharingan',
        'great-fireball',
        'body-flicker',
        'substitution-jutsu',
      ],
      gearIds: ['tanto'],
      perks: [...OPEN_SHARINGAN],
    },
  }),
  leafFighter({
    id: 'madara',
    name: 'Madara',
    familyName: 'Uchiha',
    pronouns: 'he',
    title: 'Leader of the Uchiha',
    rank: 'kage',
    // The one rival the First Hokage ever had: a step behind him, and no one else near.
    stats: statLine(34, {
      ninjutsu: 52,
      genjutsu: 44,
      taijutsu: 42,
      kenjutsu: 36,
      fuuinjutsu: 24,
      chakraControl: 44,
      reserves: 56,
      strength: 24,
      speed: 30,
      stamina: 30,
      intellect: 40,
      perception: 50,
      willpower: 48,
    }),
    clanId: 'uchiha',
    traitIds: ['proud', 'focused'],
    appearance: look(
      'long',
      { hair: '#1b1a22', eyes: '#b8322c', skin: '#e2b48c', outfit: '#b8322c' },
      'forehead',
      { shape: 'angular', expression: 'smirk', age: 'grown' },
    ),
    seal: '斑',
    specialty: 'ninjutsu',
    bio: 'Co-founder of the Hidden Leaf, who left it believing the Senju would destroy his clan. He came back with the Nine-Tails and fought Hashirama at the Valley of the End.',
    arsenal: {
      techniqueIds: [
        'madara-susanoo',
        'susanoo-slash',
        'great-fire-annihilation',
        'great-fireball',
        'coercion-sharingan',
        'substitution-jutsu',
      ],
      perks: [...OPEN_SHARINGAN],
    },
  }),
];
