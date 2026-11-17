import type { TechniqueDef } from '@/systems/techniques';

import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { soundFighter } from './fighter';

/**
 * Zaku Abumi at the chūnin exams: tubes set in his palms by Orochimaru, which blast out air
 * and sound under pressure. No element of his own; the tubes do it.
 */
export const ZAKU_ARTS: readonly TechniqueDef[] = [
  {
    id: 'slicing-sound-wave',
    name: 'Slicing Sound Wave',
    description:
      'Air and sound driven out of the tubes in his palms, hard enough to lift someone off their feet.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'damage', power: 10 },
      { verb: 'knock', power: 8, to: 'mid' },
    ],
    chakraCost: 8,
    rank: 'C',
    difficulty: 75,
  },
  {
    id: 'extreme-decapitating-airwaves',
    name: 'Extreme Decapitating Airwaves',
    description:
      'Both palms at once, at full pressure. The blast tears up the ground and everything on it.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'area', power: 16 },
      { verb: 'knock', power: 8, to: 'far' },
    ],
    chakraCost: 14,
    rank: 'C',
    difficulty: 85,
  },
];

export const ZAKU: PersonDef = soundFighter({
  id: 'zaku',
  name: 'Zaku',
  familyName: 'Abumi',
  pronouns: 'he',
  role: 'genin',
  title: 'Sound genin',
  rank: 'genin',
  // In the Forest of Death and the preliminaries: a genin carried by what is built into his arms.
  stats: statLine('D', {
    strength: 9,
    speed: 11,
    stamina: 10,
    reserves: 12,
    chakraControl: 11,
    intellect: 8,
    perception: 9,
    willpower: 12,
    ninjutsu: 15,
    taijutsu: 9,
  }),
  traitIds: ['brash', 'proud'],
  appearance: look(
    'spiky',
    { hair: '#1b1a22', eyes: '#2a1d14', skin: '#f3d2b3', outfit: '#2a2a32' },
    'forehead',
    { shape: 'angular', expression: 'smirk', age: 'young' },
  ),
  specialty: 'ninjutsu',
  bio: 'A street kid Orochimaru picked up and gave a purpose, and air tubes in his arms. He thinks a great deal of both.',
  arsenal: {
    techniqueIds: ['slicing-sound-wave', 'extreme-decapitating-airwaves'],
  },
});
