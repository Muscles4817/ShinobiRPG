import type { TechniqueDef } from '@/systems/techniques';

import type { ContractDef, SummonDef } from '../../../../contracts';
import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { akatsukiFighter } from './fighter';

/**
 * Pain: the Deva Path in versus, and the other five paths as bodies of his mind (`shared`, a
 * contract no one signs), all worked by Nagato from out of sight through the Rinnegan. They
 * stand with the Deva Path as a fight begins (`present`); a path sent home can be called back by
 * the Deva Path, since the engine can't call bodies from a summon. A summon carries no
 * perks, so the Naraka Path's restoring of fallen paths is the Deva Path's `raises`.
 */

const ASURA = 'asura-path';
const HUMAN = 'human-path';
const ANIMAL = 'animal-path';
const PRETA = 'preta-path';
const NARAKA = 'naraka-path';

export const PAIN_ARTS: readonly TechniqueDef[] = [
  {
    id: 'almighty-push',
    name: 'Almighty Push',
    description: 'The Deva Path lifts a hand and everything in front of him is thrown away.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid'],
    accuracy: 'sure',
    effects: [
      { verb: 'damage', power: 20 },
      { verb: 'knock', power: 10, to: 'far' },
    ],
    // Written dearer than its effects read: it throws everything in front of him away.
    chakraCost: 120,
    rank: 'S',
    difficulty: 170,
    tags: {
      delivery: ['burst'],
      shape: 'burst',
      lands: ['thrown-back', 'harmed'],
      catches: 'whole',
      answeredBy: ['distance', 'dig-in'],
      execution: { recovery: 1 },
    },
  },
  {
    id: 'universal-pull',
    name: 'Universal Pull',
    description: 'An open hand, and the target is dragged across the ground to meet a rod.',
    discipline: 'ninjutsu',
    reach: ['mid', 'far'],
    effects: [
      { verb: 'knock', power: 10, to: 'close' },
      { verb: 'daze', power: 8 },
    ],
    chakraCost: 16,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'planetary-devastation',
    name: 'Planetary Devastation',
    description:
      'A black sphere thrown into the sky pulls the ground up after it, and whoever stands on it.',
    discipline: 'ninjutsu',
    effects: [
      { verb: 'area', power: 26, size: 'vast' },
      { verb: 'pin', power: 20 },
    ],
    chakraCost: 44,
    rank: 'S',
    difficulty: 195,
    tags: {
      delivery: ['from-above'],
      shape: 'zone',
      lands: ['crushed'],
      catches: 'whole',
      answeredBy: ['break-free', 'dig-in', 'cut-free'],
      execution: { stages: true },
    },
    oncePerFight: true,
    afterCost: { kind: 'exhaustion', days: 4 },
  },
  {
    id: 'six-paths-of-pain',
    name: 'Six Paths of Pain',
    description:
      'Five more bodies in the cloak land around him, with the same ringed eyes and the same mind behind them.',
    discipline: 'ninjutsu',
    effects: [
      { verb: 'summon', power: 1, call: ASURA },
      { verb: 'summon', power: 1, call: HUMAN },
      { verb: 'summon', power: 1, call: ANIMAL },
      { verb: 'summon', power: 1, call: PRETA },
      { verb: 'summon', power: 1, call: NARAKA },
    ],
    chakraCost: 40,
    rank: 'S',
    difficulty: 190,
    oncePerFight: true,
  },
  {
    id: 'chakra-receiver',
    name: 'Chakra Receiver',
    description: 'A black rod driven in. Nagato’s chakra comes down it and the body won’t move.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'damage', power: 12 },
      { verb: 'pin', power: 12 },
    ],
    chakraCost: 10,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'asura-attack',
    name: 'Asura Attack',
    description: 'The Asura Path’s arm opens and missiles fly out of it.',
    discipline: 'ninjutsu',
    reach: ['mid', 'far'],
    effects: [{ verb: 'area', power: 20, size: 'wide' }],
    chakraCost: 18,
    rank: 'A',
    difficulty: 135,
  },
  {
    id: 'soul-removal',
    name: 'Soul Removal',
    description:
      'A hand on the head of someone who can’t get away. It reads every thought, then pulls the soul out.',
    discipline: 'ninjutsu',
    reach: ['close'],
    needsTarget: 'open',
    effects: [{ verb: 'damage', power: 30 }],
    chakraCost: 20,
    rank: 'S',
    difficulty: 170,
  },
  {
    id: 'absorption-seal',
    name: 'Blocking Technique Absorption Seal',
    description: 'The Preta Path takes hold, and the chakra flows out of the foe into him.',
    discipline: 'ninjutsu',
    reach: ['close'],
    effects: [{ verb: 'drain', power: 16, absorb: true }],
    chakraCost: 8,
    rank: 'A',
    difficulty: 135,
  },
];

const PATH_UPKEEP = 4;

/** A path: a body of the dead, pierced with receivers, seeing through Nagato's eyes. */
/*#__NO_SIDE_EFFECTS__*/
function path(id: string, name: string, kit: { desc: string; arts: readonly string[] }): SummonDef {
  return {
    id,
    name,
    description: kit.desc,
    techniqueId: 'six-paths-of-pain',
    standing: 0,
    stats: statLine(22, { ninjutsu: 30, taijutsu: 30, speed: 26, perception: 36, reserves: 30 }),
    healthScale: 1,
    maxChakra: 200,
    techniqueIds: [...kit.arts, 'chakra-receiver'],
    upkeep: PATH_UPKEEP,
    shared: true,
    // The paths stand with the Deva Path before a fight starts; nobody waits for them to be called.
    present: true,
  };
}

export const SIX_PATHS: ContractDef = {
  id: 'six-paths',
  name: 'The Six Paths of Pain',
  description: 'Not a clan but six bodies of the dead, and one pair of ringed eyes to see for all.',
  summons: [
    path(ASURA, 'Asura Path', { desc: 'A body built over into a weapon.', arts: ['asura-attack'] }),
    path(HUMAN, 'Human Path', { desc: 'Its touch reads the mind.', arts: ['soul-removal'] }),
    path(ANIMAL, 'Animal Path', { desc: 'The path that calls the beasts.', arts: [] }),
    path(PRETA, 'Preta Path', { desc: 'It drinks chakra.', arts: ['absorption-seal'] }),
    path(NARAKA, 'Naraka Path', { desc: 'The King of Hell stands behind it.', arts: [] }),
  ],
};

export const PAIN: PersonDef = akatsukiFighter({
  id: 'pain',
  homeLocationId: 'amegakure',
  name: 'Pain',
  familyName: '',
  pronouns: 'he',
  title: 'Leader of the Akatsuki',
  // Kage-level: he took the Rain from Hanzō and calls himself its god.
  rank: 'kage',
  // Nagato's chakra and Rinnegan through the Deva Path's body.
  stats: statLine(28, {
    strength: 24,
    speed: 32,
    stamina: 30,
    reserves: 58,
    chakraControl: 44,
    intellect: 42,
    perception: 46,
    willpower: 48,
    taijutsu: 34,
    ninjutsu: 50,
    genjutsu: 24,
    kenjutsu: 20,
    fuuinjutsu: 34,
  }),
  traitIds: ['proud', 'calm'],
  appearance: look(
    'spiky',
    { hair: '#c8642a', eyes: '#9a8ab8', skin: '#f3d2b3', outfit: '#2a2a32' },
    'forehead',
    { shape: 'angular', expression: 'stern', mark: 'earrings', age: 'grown' },
  ),
  specialty: 'ninjutsu',
  bio: 'Six bodies with one pair of ringed eyes. Somewhere out of sight, Nagato works them all, and wants the world to know pain.',
  arsenal: {
    techniqueIds: [
      'almighty-push',
      'universal-pull',
      'chakra-receiver',
      'six-paths-of-pain',
      'planetary-devastation',
    ],
    // The Rinnegan reads every foe; the Naraka Path brings a fallen path back up.
    perks: ['insight', 'raises'],
    summons: [ASURA, HUMAN, ANIMAL, PRETA, NARAKA],
  },
});
