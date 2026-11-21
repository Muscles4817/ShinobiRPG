import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { leafFighter } from './fighter';

/**
 * The founders, alive and at their height: Hashirama as the First Hokage who met Madara at the
 * Valley of the End, Tobirama as the Second (the Kinkaku and Ginkaku coup that killed him still to
 * come); and Yamato, the one child of Orochimaru's experiments whose body took Hashirama's cells,
 * as he leads Team Kakashi in Part II.
 */
export const SENJU_FIGHTERS: readonly PersonDef[] = [
  leafFighter({
    id: 'hashirama',
    name: 'Hashirama',
    familyName: 'Senju',
    pronouns: 'he',
    title: 'First Hokage',
    rank: 'kage',
    // The God of Shinobi: the top of the scale, with a life force no one else has.
    stats: statLine(36, {
      ninjutsu: 56,
      taijutsu: 40,
      genjutsu: 18,
      kenjutsu: 30,
      fuuinjutsu: 36,
      chakraControl: 46,
      reserves: 60,
      strength: 26,
      speed: 30,
      stamina: 30,
      intellect: 36,
      perception: 40,
      willpower: 50,
    }),
    traitIds: ['kind', 'brash'],
    appearance: look(
      'long',
      { hair: '#1b1a22', eyes: '#2a1d14', skin: '#c68e63', outfit: '#b8322c' },
      'forehead',
      { shape: 'long', figure: 'broad', expression: 'smile', age: 'grown' },
    ),
    seal: '柱',
    specialty: 'ninjutsu',
    bio: 'Founder of the Hidden Leaf and its First Hokage, the only one ever born with Wood Release. Easily wounded in spirit, and almost impossible to wound in body.',
    arsenal: {
      techniqueIds: [
        'hashirama-sage-mode',
        'true-several-thousand-hands',
        'wood-dragon',
        'wood-golem',
        'flowering-tree-world',
        'wood-release-deep-forest',
        'wood-clone',
        'wood-locking-wall',
        'substitution-jutsu',
      ],
    },
  }),
  leafFighter({
    id: 'tobirama',
    name: 'Tobirama',
    familyName: 'Senju',
    pronouns: 'he',
    title: 'Second Hokage',
    rank: 'kage',
    // A sensor, an inventor of jutsu, and as fast as anyone in his age.
    stats: statLine(24, {
      ninjutsu: 44,
      taijutsu: 30,
      genjutsu: 18,
      kenjutsu: 32,
      fuuinjutsu: 40,
      chakraControl: 40,
      reserves: 34,
      strength: 20,
      speed: 30,
      stamina: 24,
      intellect: 46,
      perception: 44,
      willpower: 38,
    }),
    traitIds: ['calm', 'focused'],
    appearance: look(
      'spiky',
      { hair: '#e8e0d0', eyes: '#b8322c', skin: '#e2b48c', outfit: '#3d5fa8' },
      'forehead',
      { shape: 'angular', expression: 'stern', mark: 'scar', age: 'grown' },
    ),
    seal: '扉',
    specialty: 'ninjutsu',
    bio: 'Hashirama’s younger brother and the Second Hokage, who built the village’s institutions and invented the Shadow Clone, the Flying Thunder God and worse. Water Release out of thin air was his speciality.',
    arsenal: {
      techniqueIds: [
        'water-dragon-bullet',
        'water-shockwave',
        'water-formation-wall',
        'flying-thunder-god',
        'flying-thunder-god-strike',
        'flying-thunder-god-slash',
        'chakra-sensing',
        'substitution-jutsu',
      ],
      gearIds: ['marked-kunai'],
      // The Flying Thunder God: a change of distance in an instant (`teleport`).
      perks: ['teleport'],
    },
  }),
  leafFighter({
    id: 'yamato',
    name: 'Yamato',
    familyName: '',
    pronouns: 'he',
    title: 'ANBU captain',
    rank: 'jonin',
    // Part II, leading Team Kakashi: Wood Release from the First's cells, and a careful head.
    stats: statLine(18, {
      ninjutsu: 36,
      taijutsu: 20,
      genjutsu: 12,
      kenjutsu: 18,
      fuuinjutsu: 26,
      chakraControl: 30,
      reserves: 28,
      strength: 14,
      speed: 16,
      stamina: 18,
      intellect: 28,
      perception: 22,
      willpower: 26,
    }),
    traitIds: ['calm', 'diligent'],
    appearance: look(
      'short',
      { hair: '#4a2f1d', eyes: '#1b1a22', skin: '#e2b48c', outfit: '#5a7a4a' },
      'forehead',
      { shape: 'square', eyes: 'round', expression: 'calm', age: 'grown' },
    ),
    seal: '和',
    specialty: 'ninjutsu',
    bio: 'Tenzō of ANBU, the only survivor of Orochimaru’s experiments with the First Hokage’s cells. Keeps order with a polite smile and a frightening face.',
    arsenal: {
      techniqueIds: [
        'wood-spikes',
        'four-pillar-prison',
        'wood-locking-wall',
        'wood-clone',
        'substitution-jutsu',
        'body-flicker',
      ],
    },
  }),
];
