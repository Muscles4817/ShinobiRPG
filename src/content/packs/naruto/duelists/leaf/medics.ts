import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { leafFighter } from './fighter';

/**
 * The Leaf's great medics as Part II finds them, Tsunade the Fifth Hokage and her assistant
 * Shizune. Tsunade's body is a strong woman's; what goes past it (the strength that splits the
 * ground) is Chakra Enhanced Strength in her arsenal, and her finest control is the rest.
 */
export const MEDIC_FIGHTERS: readonly PersonDef[] = [
  leafFighter({
    id: 'tsunade',
    name: 'Tsunade',
    familyName: 'Senju',
    pronouns: 'she',
    title: 'Fifth Hokage',
    rank: 'kage',
    // Part II, Hokage: the best medic alive, and a fighter who never needs to be hit twice.
    stats: statLine(22, {
      taijutsu: 40,
      ninjutsu: 42,
      genjutsu: 14,
      kenjutsu: 10,
      fuuinjutsu: 28,
      chakraControl: 52,
      reserves: 40,
      strength: 26,
      speed: 18,
      stamina: 28,
      intellect: 38,
      perception: 30,
      willpower: 36,
    }),
    traitIds: ['brash', 'proud'],
    appearance: look(
      'ponytail',
      { hair: '#e0b64a', eyes: '#8a5a2b', skin: '#f3d2b3', outfit: '#5a7a4a' },
      'belt',
      { shape: 'oval', expression: 'stern', age: 'grown' },
    ),
    seal: '綱',
    specialty: 'taijutsu',
    bio: 'Granddaughter of the First Hokage, one of the three Sannin and the finest medical ninja of her age. A legendary gambler, and a legendarily bad one.',
    arsenal: {
      techniqueIds: [
        'chakra-enhanced-strength',
        'heavenly-foot-of-pain',
        'strength-of-a-hundred',
        'creation-rebirth',
        'mystical-palm',
        'substitution-jutsu',
      ],
      summons: ['katsuyu'],
    },
  }),
  leafFighter({
    id: 'shizune',
    name: 'Shizune',
    familyName: '',
    pronouns: 'she',
    title: 'Medical ninja',
    rank: 'jonin',
    // Part II: Tsunade's assistant, a medic who fights with poison from a distance.
    stats: statLine(12, {
      ninjutsu: 26,
      taijutsu: 14,
      genjutsu: 10,
      kenjutsu: 8,
      fuuinjutsu: 12,
      chakraControl: 30,
      reserves: 16,
      strength: 9,
      speed: 15,
      stamina: 13,
      intellect: 24,
      perception: 20,
      willpower: 20,
    }),
    traitIds: ['diligent', 'kind'],
    appearance: look(
      'bob',
      { hair: '#1b1a22', eyes: '#2a1d14', skin: '#f3d2b3', outfit: '#1b1a22' },
      'forehead',
      { shape: 'oval', expression: 'worried', age: 'grown' },
    ),
    specialty: 'ninjutsu',
    bio: 'Dan’s niece, who followed Tsunade through years of wandering and gambling debts. Her medicine is as good as her poisons, and she carries both.',
    arsenal: {
      techniqueIds: [
        'hidden-needle-launcher',
        'poison-mist',
        'senbon-needles',
        'mystical-palm',
        'substitution-jutsu',
      ],
    },
  }),
];
