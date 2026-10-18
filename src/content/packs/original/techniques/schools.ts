import type { TechniqueDef } from '@/systems/techniques';

/**
 * The village's fighting schools: styles taught by their teachers, never shelved for everyone.
 * Lantern Wind (fast kicks and the inner fire, Gōran), Iron Gate (throws and holds, the bridge
 * watch's captain), Moth Needle (pressure points, Suzu), River Draw (the drawn blade, Gen) and
 * Twin Cut (paired and flurrying blades, Tetsu). Older school techniques live in their art's
 * file and say their school there.
 */
/** What each school's teacher teaches of it, in the order they teach it. */
export const LANTERN_WIND = [
  'rising-gale',
  'spinning-gale',
  'kindled-pulse',
  'lantern-wind-flurry',
  'banked-coals',
] as const;
export const TWIN_CUT = ['paired-cuts', 'thousand-cuts', 'forge-yard-storm'] as const;

export const SCHOOL_TECHNIQUES: readonly TechniqueDef[] = [
  {
    id: 'rising-gale',
    name: 'Rising Gale',
    description: 'A kick from a crouch that lifts them off their feet and drops them out of reach.',
    discipline: 'taijutsu',
    school: 'Lantern Wind',
    effects: [
      { verb: 'damage', power: 11 },
      { verb: 'knock', power: 6, to: 'mid' },
      { verb: 'daze', power: 6 },
    ],
    chakraCost: 7,
    rank: 'D',
    difficulty: 60,
  },
  {
    id: 'spinning-gale',
    name: 'Spinning Gale',
    description: 'Four kicks in one turn of the body, each landing before the last is felt.',
    discipline: 'taijutsu',
    school: 'Lantern Wind',
    accuracy: 'sure',
    effects: [{ verb: 'damage', power: 16, hits: 4 }],
    chakraCost: 9,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'lantern-wind-flurry',
    name: 'Lantern Wind Flurry',
    description:
      'Five kicks like a gust through a lantern street, and the last one rings the head.',
    discipline: 'taijutsu',
    school: 'Lantern Wind',
    accuracy: 'sure',
    effects: [
      { verb: 'damage', power: 19, hits: 5 },
      { verb: 'daze', power: 8 },
    ],
    chakraCost: 13,
    rank: 'B',
    difficulty: 115,
  },
  {
    id: 'gatekeepers-throw',
    name: 'Gatekeeper’s Throw',
    description: 'Take the arm, turn the hip, and send them out through the gate they came in by.',
    discipline: 'taijutsu',
    school: 'Iron Gate',
    effects: [
      { verb: 'damage', power: 16 },
      { verb: 'knock', power: 8, to: 'far' },
      { verb: 'daze', power: 6 },
    ],
    chakraCost: 10,
    rank: 'C',
    difficulty: 85,
  },
  {
    id: 'iron-hold',
    name: 'Iron Hold',
    description:
      'A hold the bridge watch teaches for smugglers, which tightens every time they move.',
    discipline: 'taijutsu',
    school: 'Iron Gate',
    effects: [
      { verb: 'damage', power: 8 },
      { verb: 'pin', power: 16 },
    ],
    chakraCost: 12,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'moth-wing-strike',
    name: 'Moth-Wing Strike',
    description: 'Two fingertips to the chakra points under the collarbone; the flow stutters.',
    discipline: 'taijutsu',
    school: 'Moth Needle',
    accuracy: 'sure',
    effects: [
      { verb: 'damage', power: 8 },
      { verb: 'drain', power: 10 },
      { verb: 'daze', power: 6 },
    ],
    chakraCost: 9,
    rank: 'C',
    difficulty: 85,
  },
  {
    id: 'hundred-moths',
    name: 'Hundred Moths',
    description: 'A flutter of strikes to every point at once, and the chakra stops answering.',
    discipline: 'taijutsu',
    school: 'Moth Needle',
    accuracy: 'sure',
    effects: [
      { verb: 'damage', power: 12, hits: 5 },
      { verb: 'drain', power: 12 },
      { verb: 'seal', power: 12 },
    ],
    chakraCost: 15,
    rank: 'B',
    difficulty: 115,
  },
  {
    id: 'still-water',
    name: 'Still Water',
    description: 'Hand on the hilt and nothing else moving, until the other one moves.',
    discipline: 'kenjutsu',
    school: 'River Draw',
    effects: [{ verb: 'counter', power: 12 }],
    chakraCost: 6,
    rank: 'D',
    needs: { weapon: 'blade' },
    difficulty: 60,
  },
  {
    id: 'first-light-draw',
    name: 'First Light Draw',
    description: 'The blade leaves the scabbard and comes back before the eye catches the light.',
    discipline: 'kenjutsu',
    school: 'River Draw',
    accuracy: 'sure',
    effects: [{ verb: 'damage', power: 17 }],
    chakraCost: 10,
    rank: 'C',
    needs: { weapon: 'blade' },
    difficulty: 85,
  },
  {
    id: 'return-current',
    name: 'Return Current',
    description: 'Wait for the river to push, then cut along the way it came back.',
    discipline: 'kenjutsu',
    school: 'River Draw',
    effects: [
      { verb: 'counter', power: 16 },
      { verb: 'damage', power: 15 },
    ],
    chakraCost: 13,
    rank: 'B',
    needs: { weapon: 'blade' },
    difficulty: 115,
  },
  {
    id: 'paired-cuts',
    name: 'Paired Cuts',
    description: 'Two cuts so close together they sound like one.',
    discipline: 'kenjutsu',
    school: 'Twin Cut',
    effects: [{ verb: 'damage', power: 14, hits: 2 }],
    chakraCost: 7,
    rank: 'D',
    needs: { weapon: 'blade' },
    difficulty: 60,
  },
  {
    id: 'thousand-cuts',
    name: 'Thousand Cuts',
    description: 'Not a thousand. Four, shallow and quick, and every one of them keeps bleeding.',
    discipline: 'kenjutsu',
    school: 'Twin Cut',
    effects: [
      { verb: 'damage', power: 15, hits: 4 },
      { verb: 'afflict', power: 6, harm: 'bleed' },
    ],
    chakraCost: 11,
    rank: 'C',
    needs: { weapon: 'blade' },
    difficulty: 90,
  },
];
