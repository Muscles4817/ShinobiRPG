import type { TechniqueDef } from '@/systems/techniques';

/**
 * The arts of the Leaf's shadows and its Uchiha beyond the pack's: Danzō's wind and the Izanagi
 * his stolen eyes buy, Sai's ink beasts, Shisui's Kotoamatsukami and Madara's Susanoo. A
 * Kotoamatsukami rewrites a will; here it is the strongest confusion there is, once a fight. A
 * Susanoo is a giant of chakra round its user, written as cast armour and the cut of its blade.
 */
export const SHADOW_ARTS: readonly TechniqueDef[] = [
  {
    id: 'vacuum-great-sphere',
    name: 'Wind Style: Vacuum Great Sphere',
    description:
      'One breath, and a ball of compressed wind the size of a house tears across the field.',
    discipline: 'ninjutsu',
    element: 'wind',
    reach: ['mid', 'far'],
    effects: [{ verb: 'damage', power: 28 }],
    chakraCost: 22,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'pressure-damage',
    name: 'Wind Style: Pressure Damage',
    description:
      'A storm of wind breathed out over everything in front of its user, flattening what it hits.',
    discipline: 'ninjutsu',
    element: 'wind',
    effects: [{ verb: 'area', power: 24, size: 'wide' }],
    chakraCost: 26,
    rank: 'A',
    difficulty: 145,
  },
  {
    id: 'izanagi',
    name: 'Izanagi',
    description:
      'A Sharingan closes for good, and the blow that should have killed its owner becomes a dream they woke from.',
    discipline: 'genjutsu',
    effects: [{ verb: 'heal', power: 40 }],
    chakraCost: 20,
    rank: 'S',
    difficulty: 190,
    oncePerFight: true,
    afterCost: { kind: 'injury', stat: 'perception', amount: 2, days: 14 },
  },
  {
    id: 'super-beast-lions',
    name: 'Super Beast Imitating Drawing: Lions',
    description:
      'A few strokes of the brush, and ink lions leap off the scroll and maul whoever is there.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid'],
    effects: [{ verb: 'damage', power: 18, hits: 2 }],
    chakraCost: 12,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'super-beast-snakes',
    name: 'Super Beast Imitating Drawing: Snakes',
    description: 'Ink snakes slither off the page and coil round the enemy’s limbs.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid', 'far'],
    effects: [{ verb: 'pin', power: 14 }],
    chakraCost: 10,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'super-beast-bird',
    name: 'Super Beast Imitating Drawing: Bird',
    description:
      'A great ink bird lifts off the scroll with its painter on its back, out of reach.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'move', power: 8, to: 'far' }],
    chakraCost: 10,
    rank: 'B',
    difficulty: 100,
  },
  {
    id: 'kotoamatsukami',
    name: 'Kotoamatsukami',
    description:
      'The Mangekyō turns, and they act on a will that isn’t theirs, never knowing it was put there.',
    discipline: 'genjutsu',
    clan: 'uchiha',
    effects: [
      { verb: 'confuse', power: 30 },
      { verb: 'daze', power: 10 },
    ],
    chakraCost: 30,
    rank: 'S',
    difficulty: 200,
    oncePerFight: true,
    afterCost: { kind: 'injury', stat: 'perception', amount: 3, days: 14 },
  },
  {
    id: 'madara-susanoo',
    name: 'Susanoo',
    description:
      'A towering warrior of blue chakra rises round its user in layers of bone and flesh, and blows break on it.',
    discipline: 'ninjutsu',
    clan: 'uchiha',
    effects: [{ verb: 'shroud', power: 24, kind: 'chakra' }],
    chakraCost: 30,
    rank: 'S',
    difficulty: 200,
  },
  {
    id: 'susanoo-slash',
    name: 'Susanoo: Blade',
    description: 'The giant’s arm swings its sword, and a hillside goes with it.',
    discipline: 'ninjutsu',
    clan: 'uchiha',
    reach: ['close', 'mid', 'far'],
    effects: [{ verb: 'area', power: 34, size: 'wide' }],
    chakraCost: 30,
    rank: 'S',
    difficulty: 195,
  },
];
