import type { TechniqueDef } from '@/systems/techniques';

/**
 * More plain weapon forms: a two-beat cut and a lunge to open with, parries that answer a blow,
 * a rain of cuts and a hilt that shoves, a pinwheel that catches everyone, and at the top a
 * storm of paper cuts. All are body moves, paid in breath.
 */
export const KENJUTSU_VARIANTS: readonly TechniqueDef[] = [
  {
    id: 'two-beat-cut',
    name: 'Two-Beat Cut',
    description:
      'Down and back up again in the time of one stroke, the second cut finding whatever the first one opened.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    effects: [{ verb: 'damage', power: 12, hits: 2 }],
    chakraCost: 4,
    rank: 'E',
    difficulty: 35,
  },
  {
    id: 'lamppost-lunge',
    name: 'Lamppost Lunge',
    description:
      'A long straight thrust from as far off as the blade will reach, the arm and the steel in one line like a lamppost.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    reach: ['mid'],
    accuracy: 'sure',
    effects: [{ verb: 'damage', power: 14 }],
    chakraCost: 7,
    rank: 'D',
    difficulty: 55,
  },
  {
    id: 'turning-parry',
    name: 'Turning Parry',
    description:
      'Hold the blade low and wait, then turn their stroke along your edge and back into them before they can recover.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    reach: ['close'],
    effects: [{ verb: 'counter', power: 13 }],
    chakraCost: 6,
    rank: 'D',
    difficulty: 55,
  },
  {
    id: 'rainfall-cuts',
    name: 'Rainfall Cuts',
    description:
      'Short cuts falling one after another like rain off the eaves, each too small to stop for and too many to stop.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    effects: [{ verb: 'damage', power: 18, hits: 3 }],
    chakraCost: 9,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'hilt-shove',
    name: 'Hilt Shove',
    description:
      'Drive the hilt into their chest instead of the edge and follow it with your weight until they stagger back out of reach.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    reach: ['close'],
    effects: [
      { verb: 'damage', power: 10 },
      { verb: 'knock', power: 8, to: 'mid' },
    ],
    chakraCost: 8,
    rank: 'C',
    difficulty: 75,
  },
  {
    id: 'pinwheel-blade',
    name: 'Pinwheel Blade',
    description:
      'Spin with the sword held out flat like a festival pinwheel and cut a ring round you that leaves everyone in it bleeding.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    reach: ['close'],
    effects: [
      { verb: 'area', power: 14, size: 'wide' },
      { verb: 'afflict', power: 6, harm: 'bleed' },
    ],
    chakraCost: 14,
    rank: 'B',
    difficulty: 115,
  },
  {
    id: 'crossed-riposte',
    name: 'Crossed Riposte',
    description:
      'Meet their stroke with the blade crossed, slide down to their hands and answer before the steel has stopped ringing.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    reach: ['close'],
    effects: [{ verb: 'counter', power: 18 }],
    chakraCost: 11,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'paper-cut-storm',
    name: 'Paper-Cut Storm',
    description:
      'Cuts so fine and so many that the foe feels them only afterwards, like paper drawn across the hand a hundred times.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    effects: [
      { verb: 'damage', power: 28, hits: 4 },
      { verb: 'afflict', power: 8, harm: 'bleed' },
    ],
    chakraCost: 17,
    rank: 'A',
    difficulty: 140,
  },
];
