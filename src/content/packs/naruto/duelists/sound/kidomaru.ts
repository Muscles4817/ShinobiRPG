import type { TechniqueDef } from '@/systems/techniques';

import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { soundFighter } from './fighter';

/**
 * Kidōmaru of the Sound Four at the Sasuke Retrieval, against Neji: six arms, webs spun from
 * the mouth, weapons of hardened gold, and in the second state a third eye and a bow. His
 * giant spider is left out (a summon with no contract in the pack).
 */
export const KIDOMARU_ARTS: readonly TechniqueDef[] = [
  {
    id: 'spider-sticking-spit',
    name: 'Spider Sticking Spit',
    description: 'Webbing spat across the gap, sticky as glue and strong as wire.',
    discipline: 'ninjutsu',
    reach: ['mid', 'far'],
    effects: [{ verb: 'pin', power: 12 }],
    chakraCost: 8,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'spider-sticking-gold',
    name: 'Spider Sticking Gold',
    description: 'Chakra-laced spit hardened into gold kunai, thrown from all six hands at once.',
    discipline: 'ninjutsu',
    reach: ['mid', 'far'],
    effects: [{ verb: 'damage', power: 18, hits: 3 }],
    chakraCost: 12,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'spider-bow-fierce-rip',
    name: 'Spider Bow: Fierce Rip',
    description:
      'A bow and a golden arrow spun from his own body, drawn with the third eye open. It goes through trees.',
    discipline: 'ninjutsu',
    reach: ['far'],
    accuracy: 'sure',
    effects: [{ verb: 'damage', power: 28 }],
    chakraCost: 18,
    rank: 'B',
    difficulty: 120,
  },
];

export const KIDOMARU: PersonDef = soundFighter({
  id: 'kidomaru',
  name: 'Kidōmaru',
  familyName: '',
  pronouns: 'he',
  title: 'One of the Sound Four',
  // The Sound Four held no rank of the Leaf's kind; ranked by what they could do.
  rank: 'chunin',
  // At the Sasuke Retrieval: the four's sharpest head, who plays every fight as a game.
  stats: statLine(14, {
    strength: 16,
    speed: 22,
    stamina: 16,
    reserves: 22,
    chakraControl: 22,
    intellect: 26,
    perception: 26,
    willpower: 16,
    taijutsu: 18,
    ninjutsu: 25,
    genjutsu: 8,
    kenjutsu: 10,
    fuuinjutsu: 14,
  }),
  traitIds: ['cunning', 'proud'],
  appearance: look(
    'ponytail',
    { hair: '#1b1a22', eyes: '#2a1d14', skin: '#e2b48c', outfit: '#e8e0d0' },
    'forehead',
    { shape: 'angular', expression: 'grin', age: 'young' },
  ),
  specialty: 'ninjutsu',
  bio: 'Six arms and a love of games. He keeps score, he likes a challenge, and he likes winning more.',
  arsenal: {
    techniqueIds: [
      'spider-sticking-spit',
      'spider-sticking-gold',
      'spider-bow-fierce-rip',
      'curse-mark-second-state',
    ],
  },
});
