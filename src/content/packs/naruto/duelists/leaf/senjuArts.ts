import type { TechniqueDef } from '@/systems/techniques';

/**
 * The Senju brothers' arts beyond the pack's: the First Hokage's Wood Release (Birth of Dense
 * Woodland is Orochimaru's file's, `wood-release-deep-forest`) and his perfect Sage Mode, drawn
 * in without any toad (held as long as the sage ladder holds it); the Wood Release Yamato was given from his cells; and the Second's water.
 */

const PERFECT_SAGE = { ladder: 'sage', step: 2 } as const;

export const SENJU_ARTS: readonly TechniqueDef[] = [
  {
    id: 'hashirama-sage-mode',
    name: 'Sage Mode',
    description:
      'He stills himself, and the natural energy of the world comes to him without a toad to help. Red marks rise round his eyes.',
    discipline: 'ninjutsu',
    effects: [
      {
        verb: 'empower',
        power: 1,
        boosts: ['strength', 'speed', 'stamina', 'perception', 'taijutsu', 'ninjutsu'],
        opens: PERFECT_SAGE,
        still: true,
      },
    ],
    chakraCost: 20,
    rank: 'S',
    difficulty: 190,
  },
  {
    id: 'true-several-thousand-hands',
    name: 'Sage Art: Wood Release: True Several Thousand Hands',
    description:
      'A wooden Buddha the size of a mountain rises behind him, and a thousand hands come down at once.',
    discipline: 'ninjutsu',
    needsOpen: PERFECT_SAGE,
    reach: ['close', 'mid', 'far'],
    effects: [
      { verb: 'area', power: 40, size: 'vast' },
      { verb: 'pin', power: 16 },
    ],
    chakraCost: 45,
    rank: 'S',
    difficulty: 200,
    oncePerFight: true,
  },
  {
    id: 'wood-dragon',
    name: 'Wood Release: Wood Dragon Technique',
    description: 'A dragon of living wood coils round the enemy and drinks the chakra out of them.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid', 'far'],
    effects: [
      { verb: 'damage', power: 18 },
      { verb: 'pin', power: 20 },
      { verb: 'drain', power: 16, absorb: true },
    ],
    chakraCost: 30,
    rank: 'S',
    difficulty: 185,
  },
  {
    id: 'wood-golem',
    name: 'Wood Release: Wood Golem Technique',
    description:
      'A wooden giant stands up out of the ground and brings its fist down on everything in front of it.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'area', power: 30, size: 'wide' },
      { verb: 'daze', power: 10 },
    ],
    chakraCost: 30,
    rank: 'S',
    difficulty: 180,
  },
  {
    id: 'flowering-tree-world',
    name: 'Wood Release: Nativity of a Flowering Tree World',
    description:
      'A forest bursts into flower, and its pollen puts whoever breathes it to sleep where they stand.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid', 'far'],
    effects: [
      { verb: 'area', power: 8, size: 'wide' },
      { verb: 'daze', power: 16 },
    ],
    chakraCost: 28,
    rank: 'S',
    difficulty: 180,
  },
  {
    id: 'wood-clone',
    name: 'Wood Release: Wood Clone Technique',
    description:
      'A copy grown out of wood with a share of its maker’s chakra, and all of their techniques.',
    discipline: 'ninjutsu',
    // Solid, of no element: it fights as a shadow clone does (`rules/shadowClones.ts`).
    effects: [{ verb: 'clone', power: 10, strikes: true }],
    chakraCost: 14,
    rank: 'A',
    difficulty: 130,
  },
  {
    id: 'wood-locking-wall',
    name: 'Wood Release: Wood Locking Wall',
    description: 'Wooden beams curve up and lock over him in a dome before the blow arrives.',
    discipline: 'ninjutsu',
    effects: [{ verb: 'substitute', power: 14 }],
    chakraCost: 14,
    rank: 'A',
    difficulty: 130,
  },
  {
    id: 'four-pillar-prison',
    name: 'Wood Release: Four Pillar Prison',
    description: 'Thick wooden pillars burst up round the enemy and close into a cage.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid', 'far'],
    effects: [{ verb: 'pin', power: 18 }],
    chakraCost: 18,
    rank: 'A',
    difficulty: 135,
  },
  {
    id: 'wood-spikes',
    name: 'Wood Release: Wood Spikes',
    description: 'Branches shoot out of his arm or the ground, sharpened to spears as they come.',
    discipline: 'ninjutsu',
    reach: ['close', 'mid'],
    effects: [{ verb: 'damage', power: 20, hits: 2 }],
    chakraCost: 14,
    rank: 'A',
    difficulty: 125,
  },
  {
    id: 'water-shockwave',
    name: 'Water Release: Water Shockwave',
    description:
      'Water gushes from his mouth in a wave that floods the field, where there was no water before.',
    discipline: 'ninjutsu',
    element: 'water',
    reach: ['close', 'mid', 'far'],
    effects: [{ verb: 'area', power: 24, size: 'wide' }],
    chakraCost: 26,
    rank: 'S',
    difficulty: 175,
  },
];
