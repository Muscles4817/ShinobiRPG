import type { TechniqueDef } from '@/systems/techniques';

/**
 * Tidewire: a fighting school of the coast, taught on the breakwater by a retired chūnin. Wire
 * from the net-mender's, cast like a line: it binds a leg, hauls a fighter in, and at its best
 * drops a net over a whole crew.
 */
export const TIDEWIRE = ['mending-line', 'undertow', 'cast-net'] as const;

export const TIDEWIRE_TECHNIQUES: readonly TechniqueDef[] = [
  {
    id: 'mending-line',
    name: 'Mending Line',
    description: 'A wire cast low, like a line to a float. It wraps an ankle and holds.',
    discipline: 'taijutsu',
    school: 'Tidewire',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'damage', power: 6 },
      { verb: 'pin', power: 10 },
    ],
    chakraCost: 6,
    rank: 'D',
    difficulty: 55,
  },
  {
    id: 'undertow',
    name: 'Undertow',
    description: 'Hook them with the wire and haul, and they come in off their feet.',
    discipline: 'taijutsu',
    school: 'Tidewire',
    reach: ['mid', 'far'],
    effects: [
      { verb: 'damage', power: 12 },
      { verb: 'knock', power: 6, to: 'close' },
      { verb: 'daze', power: 5 },
    ],
    chakraCost: 9,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'cast-net',
    name: 'Cast Net',
    description:
      'A weighted net of chakra-stiffened wire, thrown wide over everyone in front of you.',
    discipline: 'taijutsu',
    school: 'Tidewire',
    reach: ['mid', 'far'],
    effects: [
      { verb: 'area', power: 10, size: 'wide' },
      { verb: 'pin', power: 12 },
    ],
    chakraCost: 14,
    rank: 'C',
    difficulty: 95,
  },
];
