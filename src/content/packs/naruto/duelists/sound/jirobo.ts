import type { TechniqueDef } from '@/systems/techniques';

import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { soundFighter } from './fighter';

/**
 * Jirōbō of the Sound Four at the Sasuke Retrieval, who stayed behind for Shikamaru's team and
 * fell to Chōji: an earth dome that drinks the chakra of everyone inside, rock torn up and
 * thrown, and in the second state the Arhat Fist.
 */
export const JIROBO_ARTS: readonly TechniqueDef[] = [
  {
    id: 'earth-prison-dome',
    name: 'Earth Style Barrier: Earth Prison Dome of Magnificent Nothingness',
    description:
      'A dome of rock slams down over them, and his hands on its wall drink the chakra of everyone inside.',
    discipline: 'ninjutsu',
    element: 'earth',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'pin', power: 14, channelled: true },
      { verb: 'drain', power: 14, absorb: true },
    ],
    chakraCost: 18,
    rank: 'B',
    difficulty: 115,
  },
  {
    id: 'earth-mausoleum-dumpling',
    name: 'Earth Style: Earth Mausoleum Dumpling',
    description: 'He tears a hill’s worth of ground out of the earth and throws it.',
    discipline: 'ninjutsu',
    element: 'earth',
    reach: ['mid'],
    effects: [
      { verb: 'damage', power: 24 },
      { verb: 'break', power: 6 },
    ],
    chakraCost: 16,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'arhat-fist',
    name: 'Arhat Fist',
    description: 'A string of blows from a body the curse mark has made huge, each one a hammer.',
    discipline: 'taijutsu',
    reach: ['close'],
    effects: [
      { verb: 'damage', power: 22, hits: 3 },
      { verb: 'knock', power: 6, to: 'mid' },
    ],
    chakraCost: 10,
    rank: 'B',
    difficulty: 110,
  },
];

export const JIROBO: PersonDef = soundFighter({
  id: 'jirobo',
  name: 'Jirōbō',
  familyName: '',
  pronouns: 'he',
  title: 'One of the Sound Four',
  // The Sound Four held no rank of the Leaf's kind; ranked by what they could do.
  rank: 'chunin',
  // At the Sasuke Retrieval: the strongest body of the four, and the slowest.
  stats: statLine(14, {
    strength: 30,
    speed: 12,
    stamina: 28,
    reserves: 26,
    chakraControl: 18,
    intellect: 12,
    perception: 14,
    willpower: 18,
    taijutsu: 24,
    ninjutsu: 22,
    genjutsu: 6,
    kenjutsu: 6,
    fuuinjutsu: 16,
  }),
  traitIds: ['proud', 'brash'],
  appearance: look(
    'shaved',
    { hair: '#b8322c', eyes: '#2a1d14', skin: '#e2b48c', outfit: '#e8e0d0' },
    'forehead',
    { shape: 'round', figure: 'broad', expression: 'stern', age: 'young' },
  ),
  specialty: 'taijutsu',
  bio: 'The biggest of the Sound Four and the politest, until he isn’t. He eats chakra the way Chōji eats everything else.',
  arsenal: {
    techniqueIds: [
      'earth-prison-dome',
      'earth-mausoleum-dumpling',
      'arhat-fist',
      'curse-mark-second-state',
    ],
  },
});
