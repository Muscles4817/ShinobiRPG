import type { TechniqueDef } from '@/systems/techniques';

import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { soundFighter } from './fighter';

/**
 * Hebi, the team Sasuke gathered from Orochimaru's hideouts, as it formed: Suigetsu let out of
 * his tank and gone for Zabuza's blade, Jūgo out of his cell in the northern hideout, Karin
 * from the southern one. Suigetsu's water body is the Hōzuki art already in the pack; Jūgo's
 * sage transformation is a plain empower, and Karin fights with the sense she is wanted for.
 * Her healing bite is left out: it mends whoever bites her, never herself.
 */
export const TAKA_ARTS: readonly TechniqueDef[] = [
  {
    id: 'sage-transformation',
    name: 'Sage Transformation',
    description:
      'Natural energy drawn in through the skin, and his body changes shape to fit the killing: the skin darkens, the arms swell, the urge takes him over.',
    discipline: 'taijutsu',
    effects: [
      {
        verb: 'empower',
        power: 11,
        boosts: ['strength', 'speed', 'stamina', 'taijutsu'],
        healthPerExchange: 2,
      },
    ],
    chakraCost: 14,
    rank: 'B',
    difficulty: 115,
    oncePerFight: true,
  },
  {
    id: 'transformed-arm',
    name: 'Transformed Arm',
    description: 'One arm grown into a great mass of flesh and spikes, swung like a club.',
    discipline: 'taijutsu',
    moulded: true,
    reach: ['close'],
    effects: [
      { verb: 'damage', power: 24 },
      { verb: 'break', power: 8 },
    ],
    chakraCost: 12,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'kagura-minds-eye',
    name: 'Mind’s Eye of the Kagura',
    description:
      'Eyes shut, she feels every chakra for miles round, where it is, and whose it is, hidden or not.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'sense', power: 20, scaling: { drive: ['perception', 'chakraControl'] } }],
    chakraCost: 6,
    rank: 'C',
    difficulty: 85,
  },
];

const SUIGETSU: PersonDef = soundFighter({
  id: 'suigetsu',
  name: 'Suigetsu',
  familyName: 'Hōzuki',
  pronouns: 'he',
  clanId: 'hozuki',
  homeLocationId: 'kirigakure',
  title: 'Of Hebi',
  // He held no rank by then; ranked by what he could do.
  rank: 'chunin',
  // As Hebi formed: fresh out of Orochimaru's tank, with Kubikiribōchō just taken from Zabuza's grave.
  stats: statLine(12, {
    strength: 14,
    speed: 20,
    stamina: 18,
    reserves: 22,
    chakraControl: 22,
    intellect: 14,
    perception: 14,
    willpower: 16,
    taijutsu: 16,
    ninjutsu: 22,
    genjutsu: 6,
    kenjutsu: 24,
    fuuinjutsu: 6,
  }),
  traitIds: ['brash', 'proud'],
  appearance: look(
    'short',
    { hair: '#e8e0d0', eyes: '#7a4a8a', skin: '#f3d2b3', outfit: '#5a3a6e' },
    'belt',
    { shape: 'angular', expression: 'grin', age: 'young' },
  ),
  specialty: 'kenjutsu',
  bio: 'Mangetsu’s little brother, kept in a tank by Orochimaru until Sasuke let him out. He wants all seven of the Mist’s swords, and has started with Zabuza’s.',
  arsenal: {
    techniqueIds: ['decapitating-sweep', 'hydrification', 'great-water-arm'],
    gearIds: ['kubikiribocho'],
  },
});

const JUGO: PersonDef = soundFighter({
  id: 'jugo',
  name: 'Jūgo',
  familyName: '',
  pronouns: 'he',
  title: 'Of Hebi',
  // He held no rank; ranked by what he could do.
  rank: 'jonin',
  // As Hebi formed: the source of the curse mark, out of his cell and holding himself back.
  stats: statLine(12, {
    strength: 32,
    speed: 20,
    stamina: 32,
    reserves: 30,
    chakraControl: 14,
    intellect: 12,
    perception: 18,
    willpower: 8,
    taijutsu: 26,
    ninjutsu: 14,
    genjutsu: 4,
    kenjutsu: 4,
    fuuinjutsu: 4,
  }),
  traitIds: ['kind', 'calm'],
  appearance: look(
    'spiky',
    { hair: '#e8823a', eyes: '#2a1d14', skin: '#e2b48c', outfit: '#2a2a32' },
    'belt',
    { shape: 'square', figure: 'broad', expression: 'calm', age: 'young' },
  ),
  specialty: 'taijutsu',
  bio: 'Gentle and afraid of himself: an urge to kill comes over him that he can’t hold back. The curse mark was made from his body.',
  arsenal: {
    techniqueIds: ['sage-transformation', 'transformed-arm'],
  },
});

const KARIN: PersonDef = soundFighter({
  id: 'karin',
  name: 'Karin',
  familyName: 'Uzumaki',
  pronouns: 'she',
  clanId: 'uzumaki',
  title: 'Of Hebi',
  // A warden of Orochimaru's southern hideout; ranked by what she could do.
  rank: 'chunin',
  // As Hebi formed: a sensor before a fighter, with an Uzumaki's deep chakra.
  stats: statLine(10, {
    strength: 8,
    speed: 14,
    stamina: 16,
    reserves: 28,
    chakraControl: 22,
    intellect: 18,
    perception: 34,
    willpower: 16,
    taijutsu: 12,
    ninjutsu: 14,
    genjutsu: 6,
    kenjutsu: 6,
    fuuinjutsu: 8,
  }),
  traitIds: ['proud', 'cunning'],
  appearance: look(
    'long',
    { hair: '#b8322c', eyes: '#b8322c', skin: '#f3d2b3', outfit: '#5a3a6e' },
    'belt',
    { shape: 'oval', expression: 'smirk', age: 'young' },
  ),
  specialty: 'ninjutsu',
  bio: 'Kept Orochimaru’s southern hideout and every prisoner in it. She can feel a chakra miles away, and tell whose it is.',
  arsenal: {
    techniqueIds: ['kagura-minds-eye', 'basic-strike-combination', 'leg-sweep'],
  },
});

export const TAKA_FIGHTERS: readonly PersonDef[] = [SUIGETSU, JUGO, KARIN];
