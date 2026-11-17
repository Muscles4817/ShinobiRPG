import type { TechniqueDef } from '@/systems/techniques';

import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { soundFighter } from './fighter';

/**
 * Kimimaro of the Kaguya as he stood at the Sasuke Retrieval: dying of his illness, out of his
 * sickbed for Orochimaru one last time. The Willow, the Larch and the finger bullets are the
 * Kaguya's dances already in the pack; these are the rest of what he showed against Naruto,
 * Lee and Gaara, the last two in the curse mark's second state.
 */
export const KIMIMARO_ARTS: readonly TechniqueDef[] = [
  {
    id: 'dance-of-the-camellia',
    name: 'Dance of the Camellia',
    description:
      'A bone drawn out of the arm like a sword from a sheath, and thrust faster than the eye follows.',
    discipline: 'taijutsu',
    reach: ['close'],
    effects: [
      { verb: 'damage', power: 18, hits: 2 },
      { verb: 'afflict', power: 5, harm: 'bleed' },
    ],
    chakraCost: 10,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'dance-of-the-clematis-vine',
    name: 'Dance of the Clematis: Vine',
    description: 'The spine drawn out whole, a whip of bone that wraps round its target and holds.',
    discipline: 'taijutsu',
    moulded: true,
    reach: ['close', 'mid'],
    effects: [
      { verb: 'pin', power: 14 },
      { verb: 'damage', power: 8 },
    ],
    chakraCost: 12,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'dance-of-the-clematis-flower',
    name: 'Dance of the Clematis: Flower',
    description:
      'Bone grown over the arm into a drill, hard as the curse mark can make it, driven through any guard.',
    discipline: 'taijutsu',
    moulded: true,
    reach: ['close'],
    effects: [
      { verb: 'damage', power: 26 },
      { verb: 'break', power: 10 },
    ],
    chakraCost: 18,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'dance-of-the-seedling-fern',
    name: 'Dance of the Seedling Fern',
    description:
      'His hands on the ground, and a forest of bone spears bursts up out of it in every direction.',
    discipline: 'taijutsu',
    moulded: true,
    reach: ['close', 'mid', 'far'],
    effects: [
      { verb: 'area', power: 26, size: 'wide' },
      { verb: 'pin', power: 12 },
    ],
    chakraCost: 34,
    rank: 'S',
    difficulty: 175,
    oncePerFight: true,
  },
];

export const KIMIMARO: PersonDef = soundFighter({
  id: 'kimimaro',
  name: 'Kimimaro',
  familyName: 'Kaguya',
  pronouns: 'he',
  clanId: 'kaguya',
  // The last of the Kaguya, born in the Land of Water.
  homeLocationId: 'kirigakure',
  title: 'Last of the Kaguya',
  // He held no rank; ranked by what he could do.
  rank: 'jonin',
  // At the Sasuke Retrieval: the finest body Orochimaru ever wanted, already failing him.
  stats: statLine(18, {
    strength: 24,
    speed: 28,
    stamina: 20,
    reserves: 24,
    chakraControl: 28,
    intellect: 20,
    perception: 26,
    willpower: 34,
    taijutsu: 41,
    ninjutsu: 20,
    genjutsu: 8,
    kenjutsu: 20,
    fuuinjutsu: 8,
  }),
  traitIds: ['calm', 'focused'],
  appearance: look(
    'long',
    { hair: '#e8e0d0', eyes: '#4f8a3a', skin: '#f3d2b3', outfit: '#e8e0d0' },
    'belt',
    { shape: 'long', expression: 'calm', age: 'young' },
  ),
  specialty: 'taijutsu',
  bio: 'The last of the Kaguya, who found his reason to live in Orochimaru. Too ill to be the vessel, he left his sickbed to bring Sasuke in his place.',
  arsenal: {
    techniqueIds: [
      'dance-of-the-camellia',
      'dance-of-the-willow',
      'dance-of-the-larch',
      'finger-bone-bullets',
      'dance-of-the-clematis-vine',
      'dance-of-the-clematis-flower',
      'dance-of-the-seedling-fern',
      'curse-mark-second-state',
    ],
  },
});
