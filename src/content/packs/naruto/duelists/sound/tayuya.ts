import type { TechniqueDef } from '@/systems/techniques';

import type { ContractDef, SummonDef } from '../../../../contracts';
import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { soundFighter } from './fighter';

/**
 * Tayuya of the Sound Four at the Sasuke Retrieval, against Shikamaru and then Temari: a flute
 * that casts illusions and drives the three Doki, blind ogres who go where the music sends
 * them. The Doki are a contract no one signs, kept by her alone (like Orochimaru's
 * Reanimation), so they ride into versus through her arsenal's summons.
 */

const DOKI_UPKEEP = 4;

export const TAYUYA_ARTS: readonly TechniqueDef[] = [
  {
    id: 'summoning-doki',
    name: 'Summoning: Doki',
    description:
      'Blood on the palm and the ground, and three bandaged ogres come up out of the smoke to wait for the flute.',
    discipline: 'ninjutsu',
    effects: [
      { verb: 'summon', power: 1, call: 'doki-first' },
      { verb: 'summon', power: 1, call: 'doki-second' },
      { verb: 'summon', power: 1, call: 'doki-third' },
    ],
    chakraCost: 28,
    rank: 'B',
    difficulty: 120,
    oncePerFight: true,
  },
  {
    id: 'chains-of-fantasia',
    name: 'Demonic Flute: Chains of Fantasia',
    description:
      'A tune from the second state. Whoever hears it is bound fast in their own head, and feels their flesh torn away strip by strip.',
    discipline: 'genjutsu',
    effects: [
      { verb: 'pin', power: 12 },
      { verb: 'damage', power: 14 },
    ],
    chakraCost: 18,
    rank: 'A',
    difficulty: 135,
  },
  {
    id: 'doki-spirit-eating',
    name: 'Doki: Spirit Eating',
    description:
      'The bandages over a Doki’s mouth fall open and pale spirits pour out to feed on the chakra of whoever they reach.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid'],
    effects: [{ verb: 'drain', power: 16 }],
    chakraCost: 10,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'doki-crushing-blow',
    name: 'Doki: Crushing Blow',
    description: 'A blind ogre’s fist, swung where the flute says.',
    discipline: 'taijutsu',
    reach: ['close'],
    effects: [{ verb: 'damage', power: 20 }],
    chakraCost: 4,
    rank: 'C',
    difficulty: 70,
  },
];

/*#__NO_SIDE_EFFECTS__*/
function doki(call: string, ordinal: string): SummonDef {
  return {
    id: call,
    name: `${ordinal} Doki`,
    description: 'A blind, bandaged ogre with no will of its own; it fights to the flute’s tune.',
    techniqueId: 'summoning-doki',
    standing: 0,
    stats: statLine(10, {
      strength: 30,
      speed: 12,
      stamina: 30,
      perception: 4,
      intellect: 4,
      willpower: 10,
      taijutsu: 18,
      ninjutsu: 22,
      reserves: 20,
    }),
    healthScale: 1.6,
    maxChakra: 120,
    techniqueIds: ['doki-spirit-eating', 'doki-crushing-blow'],
    upkeep: DOKI_UPKEEP,
  };
}

/** Tayuya's three Doki: no clan to sign with, only the flute that drives them. */
export const DOKI: ContractDef = /*#__PURE__*/ (() => ({
  id: 'doki',
  name: 'The Doki',
  description: 'Three ogres bound to Tayuya’s summoning, blind, and driven by her flute.',
  summons: [
    doki('doki-first', 'First'),
    doki('doki-second', 'Second'),
    doki('doki-third', 'Third'),
  ],
}))();

export const TAYUYA: PersonDef = soundFighter({
  id: 'tayuya',
  name: 'Tayuya',
  familyName: '',
  pronouns: 'she',
  title: 'One of the Sound Four',
  // The Sound Four held no rank of the Leaf's kind; ranked by what they could do.
  rank: 'chunin',
  // At the Sasuke Retrieval: the four's illusionist, who fights from behind her Doki.
  stats: statLine(14, {
    strength: 10,
    speed: 18,
    stamina: 14,
    reserves: 22,
    chakraControl: 26,
    intellect: 22,
    perception: 18,
    willpower: 22,
    taijutsu: 10,
    ninjutsu: 20,
    genjutsu: 30,
    kenjutsu: 6,
    fuuinjutsu: 14,
  }),
  traitIds: ['brash', 'proud'],
  appearance: look(
    'long',
    { hair: '#b8322c', eyes: '#2a1d14', skin: '#f3d2b3', outfit: '#e8e0d0' },
    'forehead',
    { shape: 'heart', expression: 'stern', age: 'young' },
  ),
  specialty: 'genjutsu',
  bio: 'The Sound Four’s foulest mouth and its flute. She plays from the back while her Doki do the fighting.',
  arsenal: {
    techniqueIds: [
      'summoning-doki',
      'phantom-sound-chains',
      'chains-of-fantasia',
      'curse-mark-second-state',
    ],
    summons: ['doki-first', 'doki-second', 'doki-third'],
  },
});
