import type { TechniqueDef } from '@/systems/techniques';

import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { soundFighter } from './fighter';

/**
 * Sakon and Ukon of the Sound Four at the Sasuke Retrieval, against Kiba and then Kankurō:
 * brothers in one body, fought here as one fighter. Ukon comes out of Sakon to throw his own
 * blows, sinks into a foe's body to eat it from inside, and a summoned gate stands in the way.
 */
export const SAKON_ARTS: readonly TechniqueDef[] = [
  {
    id: 'multiple-connected-fist',
    name: 'Multiple Connected Fist',
    description:
      'Ukon’s arms come out of Sakon’s body with Sakon’s, and four fists land where two were coming.',
    discipline: 'taijutsu',
    reach: ['close'],
    effects: [{ verb: 'damage', power: 20, hits: 4 }],
    chakraCost: 8,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'parasitic-demon-destruction',
    name: 'Parasitic Demon Destruction',
    description: 'Ukon melts into the foe’s body and breaks it down from the inside, cell by cell.',
    discipline: 'ninjutsu',
    reach: ['close'],
    effects: [
      { verb: 'damage', power: 10 },
      { verb: 'afflict', power: 12, harm: 'poison' },
    ],
    chakraCost: 16,
    rank: 'B',
    difficulty: 115,
  },
  {
    id: 'summoning-rashomon',
    name: 'Summoning: Rashōmon',
    description: 'A great demon-faced gate rises out of the ground between him and the blow.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'substitute', power: 16 }],
    chakraCost: 16,
    rank: 'B',
    difficulty: 115,
  },
];

export const SAKON: PersonDef = soundFighter({
  id: 'sakon',
  name: 'Sakon',
  familyName: '',
  pronouns: 'he',
  title: 'One of the Sound Four, with his brother Ukon',
  // The Sound Four held no rank of the Leaf's kind; ranked by what they could do.
  rank: 'chunin',
  // At the Sasuke Retrieval: the four's leader, and two fighters' worth in one body.
  stats: statLine(14, {
    strength: 18,
    speed: 22,
    stamina: 20,
    reserves: 22,
    chakraControl: 22,
    intellect: 18,
    perception: 16,
    willpower: 18,
    taijutsu: 26,
    ninjutsu: 22,
    genjutsu: 6,
    kenjutsu: 8,
    fuuinjutsu: 14,
  }),
  traitIds: ['cunning', 'proud'],
  appearance: look(
    'bob',
    { hair: '#c9c3d9', eyes: '#2a1d14', skin: '#f3d2b3', outfit: '#e8e0d0' },
    'forehead',
    { shape: 'oval', expression: 'smirk', age: 'young' },
  ),
  specialty: 'taijutsu',
  bio: 'Leads the Sound Four, and is never alone: his brother Ukon sleeps inside his body and comes out to fight beside him.',
  arsenal: {
    techniqueIds: [
      'multiple-connected-fist',
      'parasitic-demon-destruction',
      'summoning-rashomon',
      'curse-mark-second-state',
    ],
  },
});
