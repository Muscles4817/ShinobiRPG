import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { farFighter } from './fighter';

/**
 * The Cloud's Raikage and its two jinchūriki: A, the Fourth, and his brother Killer B as they
 * stood at the Kage Summit, and Yugito Nii as she stood when Akatsuki came for her.
 */
export const CLOUD_HOUSE: readonly PersonDef[] = [
  farFighter('kumogakure', {
    id: 'a-fourth-raikage',
    name: 'A',
    familyName: '',
    pronouns: 'he',
    title: 'Fourth Raikage',
    rank: 'kage',
    // At the Kage Summit: the fastest body in the world under lightning, and a wrestler's.
    stats: statLine(24, {
      strength: 44,
      speed: 48,
      stamina: 40,
      reserves: 42,
      chakraControl: 26,
      intellect: 22,
      perception: 30,
      willpower: 38,
      taijutsu: 46,
      ninjutsu: 34,
      genjutsu: 6,
      kenjutsu: 8,
      fuuinjutsu: 8,
    }),
    traitIds: ['brash', 'proud'],
    appearance: look(
      'shaved',
      { hair: '#e8e0d0', eyes: '#3a3632', skin: '#8a5a3a', outfit: '#e8e0d0' },
      'forehead',
      {
        shape: 'square',
        figure: 'broad',
        expression: 'stern',
        age: 'grown',
        facialHair: 'moustache',
      },
    ),
    specialty: 'taijutsu',
    bio: 'Runs lightning through his body and hits harder than anyone alive. He goes through walls rather than round them.',
    arsenal: {
      techniqueIds: [
        'lightning-release-armour',
        'lariat',
        'liger-bomb',
        'hell-stab',
        'body-flicker',
      ],
    },
  }),
  farFighter('kumogakure', {
    id: 'killer-b',
    name: 'Killer B',
    familyName: '',
    pronouns: 'he',
    title: 'Jinchūriki of the Eight-Tails',
    rank: 'jonin',
    // As he fought Sasuke's team: a perfect jinchūriki who talks with his beast, and seven swords.
    stats: statLine(24, {
      strength: 36,
      speed: 32,
      stamina: 44,
      reserves: 56,
      chakraControl: 32,
      intellect: 24,
      perception: 28,
      willpower: 36,
      taijutsu: 38,
      ninjutsu: 40,
      genjutsu: 10,
      kenjutsu: 42,
      fuuinjutsu: 8,
    }),
    traitIds: ['brash', 'humble'],
    appearance: look(
      'shaved',
      { hair: '#e8e0d0', eyes: '#3a3632', skin: '#8a5a3a', outfit: '#e8e0d0' },
      'forehead',
      { shape: 'square', figure: 'broad', expression: 'grin', age: 'grown', facialHair: 'goatee' },
    ),
    specialty: 'kenjutsu',
    bio: 'The Eight-Tails’ partner, who raps badly and fights with seven swords at once. The beast in him is the nearest thing he has to a best friend.',
    arsenal: {
      techniqueIds: [
        'seven-swords-dance',
        'lariat',
        'eight-tails-cloak',
        'eight-tails-beast-ball',
        'octopus-ink',
        'octopus-clone',
      ],
      gearIds: ['seven-swords'],
      weaponMastery: { sword: 1 },
    },
  }),
  farFighter('kumogakure', {
    id: 'yugito-nii',
    name: 'Yugito',
    familyName: 'Nii',
    pronouns: 'she',
    title: 'Jinchūriki of the Two-Tails',
    rank: 'jonin',
    // As she met Hidan and Kakuzu: in full control of the Two-Tails, and alone.
    stats: statLine(16, {
      strength: 16,
      speed: 26,
      stamina: 22,
      reserves: 42,
      chakraControl: 26,
      intellect: 20,
      perception: 24,
      willpower: 26,
      taijutsu: 28,
      ninjutsu: 30,
      genjutsu: 10,
      kenjutsu: 8,
      fuuinjutsu: 8,
    }),
    traitIds: ['calm', 'focused'],
    appearance: look(
      'ponytail',
      { hair: '#e0c46a', eyes: '#3a3632', skin: '#f3d2b3', outfit: '#5a3a6e' },
      'forehead',
      { expression: 'calm', age: 'grown' },
    ),
    specialty: 'ninjutsu',
    bio: 'Has carried the Two-Tails since infancy and fights like the cat it is. The Cloud kept her close, and could not keep her safe.',
    arsenal: {
      techniqueIds: ['two-tails-cloak', 'cat-claws', 'two-tails-blue-fire', 'body-flicker'],
    },
  }),
];
