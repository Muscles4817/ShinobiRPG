import type { TechniqueDef } from '@/systems/techniques';

import type { ContractDef } from '../../../../contracts';
import { look } from '../../../../look';
import { statLine } from '../../../../statLine';
import type { PersonDef } from '../../../../types';

import { akatsukiFighter } from './fighter';

/**
 * Deidara and his explosive clay: mouths in his palms chew it full of chakra, and what he shapes
 * flies and goes off. Explosion Release is read as earth, so lightning undoes it, as it did. The
 * great bird he rides is a body he calls (a `mount`), from a contract no one signs.
 */

const CLAY_BIRD = 'clay-bird';

export const DEIDARA_ARTS: readonly TechniqueDef[] = [
  {
    id: 'c1-clay-birds',
    name: 'Explosive Clay: C1',
    description:
      'Little birds and spiders of clay, flung from his hand. They find you, then go off.',
    discipline: 'ninjutsu',
    element: 'earth',
    reach: ['mid', 'far'],
    effects: [{ verb: 'damage', power: 14, hits: 3 }],
    chakraCost: 12,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'c2-clay-dragon',
    name: 'Explosive Clay: C2 Dragon',
    description: 'A clay dragon that spits clay bombs of its own across the ground below it.',
    discipline: 'ninjutsu',
    element: 'earth',
    reach: ['mid', 'far'],
    effects: [{ verb: 'area', power: 22, size: 'wide' }],
    chakraCost: 22,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'c3-clay-bomb',
    name: 'Explosive Clay: C3',
    description:
      'One small figure dropped from above. It swells as it falls, and takes a village with it.',
    discipline: 'ninjutsu',
    element: 'earth',
    effects: [{ verb: 'area', power: 30, size: 'vast' }],
    chakraCost: 34,
    rank: 'S',
    difficulty: 175,
    oncePerFight: true,
  },
  {
    id: 'c4-karura',
    name: 'Explosive Clay: C4 Karura',
    description:
      'A giant of himself that bursts into a cloud of bombs too small to see. Breathed in, they go off inside.',
    discipline: 'ninjutsu',
    element: 'earth',
    effects: [{ verb: 'area', power: 28, size: 'wide' }],
    chakraCost: 34,
    rank: 'S',
    difficulty: 180,
    oncePerFight: true,
  },
  {
    id: 'clay-clone',
    name: 'Clay Clone',
    description: 'A copy of himself in clay that fights like him and goes off when it is caught.',
    discipline: 'ninjutsu',
    element: 'earth',
    effects: [{ verb: 'clone', power: 10, strikes: true, kind: 'earth' }],
    chakraCost: 14,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'shaping-clay-bird',
    name: 'Explosive Clay: Great Bird',
    description: 'A palm of clay, a hand sign, and a bird big enough to ride lifts off the ground.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'summon', power: 1, call: CLAY_BIRD }],
    chakraCost: 14,
    rank: 'B',
    difficulty: 105,
  },
];

export const EXPLOSIVE_CLAY: ContractDef = {
  id: 'explosive-clay',
  name: 'Explosive Clay',
  description: 'Not a clan but an art, clay shaped and given life, and his own and nobody else’s.',
  summons: [
    {
      id: CLAY_BIRD,
      name: 'Clay bird',
      description: 'A great white bird of clay that carries him out of reach and drops bombs.',
      techniqueId: 'shaping-clay-bird',
      standing: 0,
      stats: statLine(14, { speed: 30, ninjutsu: 28, perception: 20, stamina: 18 }),
      healthScale: 1.5,
      maxChakra: 160,
      techniqueIds: ['c1-clay-birds'],
      upkeep: 4,
      mount: true,
    },
  ],
};

export const DEIDARA: PersonDef = akatsukiFighter({
  id: 'deidara',
  homeLocationId: 'iwagakure',
  name: 'Deidara',
  familyName: '',
  pronouns: 'he',
  title: 'Rogue of the Stone',
  // Jōnin-grade, and a bomber who fights from the sky; his art does the rest.
  rank: 'jonin',
  stats: statLine(20, {
    strength: 16,
    speed: 28,
    reserves: 34,
    chakraControl: 38,
    intellect: 34,
    perception: 38,
    willpower: 28,
    ninjutsu: 44,
    genjutsu: 10,
    kenjutsu: 10,
    fuuinjutsu: 16,
  }),
  traitIds: ['proud', 'brash'],
  appearance: look(
    'ponytail',
    { hair: '#e0b64a', eyes: '#3d6fa8', skin: '#f3d2b3', outfit: '#2a2a32' },
    'forehead',
    { shape: 'oval', figure: 'slight', expression: 'grin', age: 'young' },
  ),
  specialty: 'ninjutsu',
  bio: 'A bomber of the Stone’s Explosion Corps who left to make his art. Art is a moment that goes off, and he will argue it with anyone.',
  arsenal: {
    techniqueIds: [
      'c1-clay-birds',
      'c2-clay-dragon',
      'c3-clay-bomb',
      'c4-karura',
      'clay-clone',
      'shaping-clay-bird',
    ],
    summons: [CLAY_BIRD],
  },
});
