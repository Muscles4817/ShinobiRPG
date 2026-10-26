import type { TechniqueDef } from '@/systems/techniques';

/**
 * Two schools kept far from any village. Moss Step is the hermit of the Cedar Deep's: how a
 * tracker goes unseen under the trees and hears who else is in them. Gravefield is the keeper of
 * the Old Battlefield's: the drill of the army that lies there, a sword planted and waited behind.
 */
export const MOSS_STEP = ['moss-step', 'cedar-hush'] as const;
export const GRAVEFIELD = ['row-cut', 'marker-stance'] as const;

export const WILD_FOLK_TECHNIQUES: readonly TechniqueDef[] = [
  {
    id: 'moss-step',
    name: 'Moss Step',
    description: 'Tread where the moss is deepest and let the trees close behind you.',
    discipline: 'ninjutsu',
    school: 'Moss Step',
    effects: [{ verb: 'conceal', power: 10, scaling: { drive: ['ninjutsu', 'speed'] } }],
    chakraCost: 6,
    rank: 'D',
    difficulty: 50,
  },
  {
    id: 'cedar-hush',
    name: 'Cedar Hush',
    description: 'Listen for the patch of forest where the birds have stopped. Someone is in it.',
    discipline: 'ninjutsu',
    school: 'Moss Step',
    effects: [{ verb: 'sense', power: 14 }],
    chakraCost: 8,
    rank: 'C',
    difficulty: 75,
  },
  {
    id: 'row-cut',
    name: 'Row Cut',
    description: 'Two cuts down a line of men, the way the old drill had it.',
    discipline: 'kenjutsu',
    school: 'Gravefield',
    needs: { weapon: 'blade' },
    effects: [{ verb: 'damage', power: 14, hits: 2 }],
    chakraCost: 6,
    rank: 'D',
    difficulty: 55,
  },
  {
    id: 'marker-stance',
    name: 'Marker Stance',
    description: 'Set the blade point down like a grave marker, and wait for them to come to it.',
    discipline: 'kenjutsu',
    school: 'Gravefield',
    needs: { weapon: 'blade' },
    effects: [
      { verb: 'counter', power: 14 },
      { verb: 'damage', power: 10 },
    ],
    chakraCost: 10,
    rank: 'C',
    difficulty: 80,
  },
];
