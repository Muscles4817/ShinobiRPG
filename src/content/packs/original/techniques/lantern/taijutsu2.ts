import type { TechniqueDef } from '@/systems/techniques';

/**
 * Taijutsu: new techniques of the lantern country, their mechanics drawn from proven shapes and their
 * names and words its own (`docs/research/lantern-techniques.md`).
 */
export const LANTERN_TAIJUTSU2: readonly TechniqueDef[] = [
  {
    id: 'mooring-hitch',
    name: 'Mooring Hitch',
    description:
      'Throw the wire twice round them and once round a post, and lean back on it like a boat on its rope.',
    discipline: 'taijutsu',
    reach: ['mid', 'far'],
    effects: [
      { verb: 'pin', power: 15, channelled: true },
      { verb: 'damage', power: 6 },
    ],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
    school: 'Tidewire',
  },
  {
    id: 'updraft-return',
    name: 'Updraft Return',
    description:
      'Let their blow pass under you like wind under a paper lantern, then come down on it heel first.',
    discipline: 'taijutsu',
    reach: ['close'],
    effects: [{ verb: 'counter', power: 17 }],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
    school: 'Lantern Wind',
  },
  {
    id: 'well-rope-throw',
    name: 'Well-Rope Throw',
    description:
      'Haul them up by the belt like a bucket from the well, then let the rope run and drop them a long way off.',
    discipline: 'taijutsu',
    reach: ['close'],
    effects: [
      { verb: 'damage', power: 18 },
      { verb: 'knock', power: 9, to: 'far' },
    ],
    chakraCost: 0,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'cocoon-of-silence',
    name: 'Cocoon of Silence',
    description:
      'Every point at once, wrapped up one after another like silk round a cocoon, until no chakra moves inside it.',
    discipline: 'taijutsu',
    reach: ['close'],
    accuracy: 'sure',
    effects: [
      { verb: 'damage', power: 18, hits: 5 },
      { verb: 'seal', power: 17 },
      { verb: 'drain', power: 14 },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
    school: 'Moth Needle',
  },
  {
    id: 'hail-on-the-tiles',
    name: 'Hail on the Tiles',
    description:
      'Blows that come down like hail on a tiled roof, too quick to count and every one of them landing.',
    discipline: 'taijutsu',
    accuracy: 'sure',
    effects: [{ verb: 'damage', power: 24, hits: 4 }],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'ridgepole-breaker',
    name: 'Ridgepole Breaker',
    description:
      'A heel brought down on the guard like a falling ridgepole, and the house under it goes with it.',
    discipline: 'taijutsu',
    accuracy: 'wild',
    effects: [
      { verb: 'break', power: 24 },
      { verb: 'daze', power: 8 },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'snuffers-palm',
    name: 'Snuffer’s Palm',
    description:
      'A short palm under the jaw, as neat as the cap that puts out a lantern, and the lights go out behind the eyes.',
    discipline: 'taijutsu',
    reach: ['close'],
    accuracy: 'sure',
    effects: [
      { verb: 'damage', power: 16 },
      { verb: 'daze', power: 12 },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
  },
  {
    id: 'spring-tide',
    name: 'Spring Tide',
    description:
      'Cast long, hook deep and haul with the whole body, and they come across the gap like a catch onto the deck.',
    discipline: 'taijutsu',
    reach: ['mid', 'far'],
    effects: [
      { verb: 'knock', power: 10, to: 'close' },
      { verb: 'damage', power: 20 },
      { verb: 'pin', power: 12 },
    ],
    chakraCost: 0,
    rank: 'A',
    difficulty: 140,
    school: 'Tidewire',
  },
];
