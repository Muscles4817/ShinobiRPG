import type { TechniqueDef } from '@/systems/techniques';

/**
 * Kenjutsu: new techniques of the lantern country, their mechanics drawn from proven shapes and their
 * names and words its own (`docs/research/lantern-techniques.md`).
 */
export const LANTERN_KENJUTSU2: readonly TechniqueDef[] = [
  {
    id: 'reed-cutters-sweep',
    name: 'Reed-Cutter’s Sweep',
    description:
      'One long flat sweep at knee height, the way the river reeds come down at harvest, and everyone in it steps back.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    reach: ['close'],
    effects: [
      { verb: 'area', power: 13, size: 'wide' },
      { verb: 'knock', power: 8, to: 'mid' },
    ],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'kurogane-sparks-off-the-anvil',
    name: 'Sparks off the Anvil',
    description:
      'Three quick strokes, each one ringing, each one throwing sparks off the foe’s guard.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    reach: ['close'],
    effects: [{ verb: 'damage', power: 19, hits: 3 }],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
    clan: 'kurogane',
    moulded: true,
  },
  {
    id: 'spate-draw',
    name: 'Spate Draw',
    description:
      'The river in flood: no warning, no wading, just the bank gone and the blade already through.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    accuracy: 'sure',
    effects: [
      { verb: 'move', power: 8, to: 'close' },
      { verb: 'damage', power: 19 },
    ],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
    school: 'River Draw',
  },
  {
    id: 'whetted-wind',
    name: 'Whetted Wind',
    description:
      'Draw the blade along a stream of wind as if along a whetstone, and every cut runs on past the steel.',
    discipline: 'kenjutsu',
    element: 'wind',
    needs: { weapon: 'blade', nature: 'wind' },
    reach: ['close', 'mid'],
    effects: [{ verb: 'damage', power: 19, hits: 3 }],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
    moulded: true,
  },
  {
    id: 'last-ferry-draw',
    name: 'Last Ferry Draw',
    description:
      'Cross the gap like the last ferry leaving the bank, and the blade is out and back before it lands.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    accuracy: 'sure',
    effects: [
      { verb: 'move', power: 8, to: 'close' },
      { verb: 'damage', power: 22 },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'roll-of-the-fallen',
    name: 'Roll of the Fallen',
    description:
      'Cut through the whole field as the old company was cut, and those left standing stand stunned.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    effects: [
      { verb: 'area', power: 18, size: 'wide' },
      { verb: 'daze', power: 8 },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
    school: 'Gravefield',
  },
  {
    id: 'kurogane-last-fold',
    name: 'The Last Fold',
    description:
      'Everything you have folded into the steel over a lifetime, let out in one step and one cut.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    accuracy: 'sure',
    effects: [
      { verb: 'move', power: 8, to: 'close' },
      { verb: 'break', power: 22 },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
    clan: 'kurogane',
    oncePerFight: true,
    moulded: true,
  },
  {
    id: 'threshing-floor',
    name: 'Threshing Floor',
    description:
      'The blade comes down again and again like flails on the threshing floor, and nobody stands up straight under it.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    reach: ['close'],
    accuracy: 'wild',
    effects: [
      { verb: 'damage', power: 24, hits: 4 },
      { verb: 'daze', power: 6 },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
];
