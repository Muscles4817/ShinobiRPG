import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { kiriFighter } from './fighter';

/**
 * The Leaf's hand in the Mist's war. On paper the Leaf wants nothing to do with it; in fact
 * ROOT raised Mei from childhood, gave her a Water Country orphan's past to go with the two
 * bloodlines she was born with, and sent her home with two handlers to win the rebellion and
 * bring the Mist under the Leaf.
 */
export const LEAF_PLANT_FIGHTERS: readonly PersonDef[] = [
  kiriFighter({
    id: 'mei',
    name: 'Mei',
    familyName: 'Terumī',
    pronouns: 'she',
    title: 'Leader of the resistance',
    rank: 'jonin',
    stats: statLine(14, {
      strength: 9,
      speed: 13,
      stamina: 13,
      reserves: 38,
      chakraControl: 34,
      intellect: 24,
      perception: 18,
      willpower: 22,
      taijutsu: 16,
      ninjutsu: 42,
      genjutsu: 18,
      kenjutsu: 8,
      fuuinjutsu: 12,
    }),
    traitIds: ['cunning', 'kind'],
    appearance: look(
      'long',
      { hair: '#b8322c', eyes: '#4f8a3a', skin: '#f3d2b3', outfit: '#3e6b3a' },
      'forehead',
      { shape: 'heart', expression: 'smile', age: 'grown' },
    ),
    specialty: 'ninjutsu',
    bio: 'An orphan of the Water Country, the story goes, born with two bloodlines in a family that had none. The rebels follow her because she is everything Yagura hunts. Only two people in the Mist know who raised her.',
    arsenal: {
      techniqueIds: [
        'lava-monster',
        'boil-skilled-mist',
        'lava-globs',
        'water-dragon-bullet',
        'water-wall',
        'body-flicker',
      ],
    },
  }),
  kiriFighter({
    id: 'root-tsuru',
    name: 'Tsuru',
    familyName: '',
    pronouns: 'he',
    title: 'Net-mender, or so he says',
    rank: 'jonin',
    stats: statLine(10, {
      strength: 9,
      stamina: 11,
      reserves: 15,
      chakraControl: 22,
      intellect: 18,
      perception: 30,
      willpower: 20,
      taijutsu: 12,
      ninjutsu: 16,
      fuuinjutsu: 30,
    }),
    traitIds: ['calm', 'cunning'],
    appearance: look(
      'short',
      { hair: '#9a9a9a', eyes: '#2a1d14', skin: '#c68e63', outfit: '#6a7a4a' },
      'neck',
      { expression: 'smile', age: 'old' },
    ),
    specialty: 'fuuinjutsu',
    bio: 'Passes as Mei’s old uncle, mending nets on the rebels’ island. A ROOT sensor with a seal on his tongue, he reports to the Leaf every new moon.',
    arsenal: {
      techniqueIds: [
        'ink-sealing-wrap',
        'chakra-sensing',
        'explosive-tag-trap',
        'substitution-jutsu',
      ],
    },
  }),
  kiriFighter({
    id: 'root-ibara',
    name: 'Ibara',
    familyName: '',
    pronouns: 'she',
    title: 'Mei’s cousin and shadow',
    rank: 'jonin',
    stats: statLine(13, {
      strength: 10,
      speed: 21,
      chakraControl: 16,
      perception: 20,
      willpower: 20,
      taijutsu: 18,
      ninjutsu: 16,
      genjutsu: 10,
      kenjutsu: 31,
      fuuinjutsu: 10,
    }),
    traitIds: ['focused', 'calm'],
    appearance: look(
      'bob',
      { hair: '#1b1a22', eyes: '#2a1d14', skin: '#e2b48c', outfit: '#2a2a32' },
      'neck',
      { shape: 'angular', expression: 'calm', age: 'young' },
    ),
    specialty: 'kenjutsu',
    bio: 'Never more than a step behind Mei, a quiet cousin nobody looks at twice. A ROOT blade, sent to keep Mei alive, and to end her if she ever forgets who raised her.',
    arsenal: {
      techniqueIds: ['root-silent-cut', 'silent-killing', 'body-flicker', 'substitution-jutsu'],
      gearIds: ['tanto'],
    },
  }),
];
