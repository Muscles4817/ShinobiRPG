import type { TechniqueDef } from '@/systems/techniques';

import type { GearDef } from '../../../../types';

/**
 * The Seven Swordsmen who serve Yagura, and their blades: Nuibari that stitches, Shibuki that
 * explodes, Kabutowari that splits helmets. And the quiet arts of ROOT's two handlers, who
 * came to the Mist with Mei and answer to the Leaf.
 */
export const SWORD_ARTS: readonly TechniqueDef[] = [
  {
    id: 'nuibari-stitch',
    name: 'Nuibari: Stitching Thread',
    description:
      'The needle-sword goes through one body, then another, and the wire draws them together.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    reach: ['close', 'mid'],
    accuracy: 'sure',
    effects: [
      { verb: 'damage', power: 16, hits: 2 },
      { verb: 'pin', power: 14 },
    ],
    chakraCost: 18,
    rank: 'A',
    difficulty: 135,
  },
  {
    id: 'shibuki-blast',
    name: 'Shibuki: Splash',
    description: 'The blade is a roll of explosive tags. Every swing sets one off.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    effects: [
      { verb: 'area', power: 20, size: 'wide' },
      { verb: 'daze', power: 6 },
    ],
    chakraCost: 20,
    rank: 'A',
    difficulty: 135,
  },
  {
    id: 'kabutowari-split',
    name: 'Kabutowari: Helmet Splitter',
    description: 'The axe catches the guard, the hammer drives the axe through it.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    reach: ['close'],
    accuracy: 'wild',
    effects: [{ verb: 'break', power: 26 }],
    chakraCost: 18,
    rank: 'A',
    difficulty: 135,
  },
  {
    id: 'samehada-shave',
    name: 'Samehada: Shaving',
    description:
      'The scaled sword rasps across the guard and drinks the chakra out of whatever it touches.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    reach: ['close'],
    effects: [
      { verb: 'damage', power: 22 },
      { verb: 'drain', power: 10, absorb: true },
    ],
    chakraCost: 14,
    rank: 'A',
    difficulty: 135,
  },
  {
    id: 'ink-sealing-wrap',
    name: 'Ink Sealing Wrap',
    description: 'Brushed seals uncoil off a scroll and wind round the target, ink to skin.',
    discipline: 'fuuinjutsu',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'pin', power: 16 },
      { verb: 'seal', power: 8 },
    ],
    chakraCost: 15,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'root-silent-cut',
    name: 'Root: Silent Cut',
    description: 'No killing intent, no sound, no flourish. The tantō is simply already there.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    reach: ['close'],
    accuracy: 'sure',
    effects: [
      { verb: 'conceal', power: 10, scaling: { drive: ['kenjutsu', 'speed'] } },
      { verb: 'damage', power: 18 },
    ],
    chakraCost: 14,
    rank: 'B',
    difficulty: 110,
  },
];

export const KIRI_BLADES: readonly GearDef[] = [
  {
    id: 'nuibari',
    name: 'Nuibari, the Sewing Needle',
    description:
      'A long needle of a sword trailing a wire. It goes through armour as if it were cloth.',
    kind: 'weapon',
    shape: 'blade',
    rank: 'A',
    unique: true,
    effects: ['sunder'],
    cost: 0,
    icon: 'sword',
  },
  {
    id: 'shibuki',
    name: 'Shibuki, the Blasting Sword',
    description: 'A short blade backed with a scroll of explosive tags that go off as it strikes.',
    kind: 'weapon',
    shape: 'blade',
    rank: 'A',
    unique: true,
    effects: ['daze'],
    cost: 0,
    icon: 'sword',
  },
  {
    id: 'kabutowari',
    name: 'Kabutowari, the Helmet Splitter',
    description: 'An axe and a hammer joined by a chain. Nothing worn stops it twice.',
    kind: 'weapon',
    shape: 'blade',
    rank: 'A',
    unique: true,
    effects: ['sunder', 'daze'],
    cost: 0,
    icon: 'sword',
  },
  {
    id: 'hiramekarei',
    name: 'Hiramekarei, the Twinsword',
    description:
      'A broad blade with two hilts, wrapped in bandages. It drinks chakra and gives it back as an edge.',
    kind: 'weapon',
    shape: 'blade',
    rank: 'A',
    unique: true,
    effects: ['drain'],
    cost: 0,
    icon: 'sword',
  },
];
