import type { TechniqueDef } from '@/systems/techniques';

/**
 * New moves of the village's fighting schools. Strong Fist's are Guy's (and Lee's, for a close
 * enough friend), Leaf Sword's Hayate's and Yūgao's. Wind Blade is the game's own knife school,
 * not canon: Asuma teaches its drills, but fights with his canon jutsu (Flying Swallow and the
 * rest, in `senseiTechniques.ts`).
 */
export const SCHOOL_TECHNIQUES: readonly TechniqueDef[] = [
  {
    id: 'moonlight-stance',
    name: 'Moonlight Stance',
    description: 'Blade low, weight back, waiting for the moon to come out from behind the cloud.',
    discipline: 'kenjutsu',
    school: 'Leaf Sword',
    needs: { weapon: 'blade' },
    effects: [{ verb: 'counter', power: 12 }],
    chakraCost: 6,
    rank: 'D',
    difficulty: 60,
  },
  {
    id: 'trench-knife-rush',
    name: 'Trench Knife Rush',
    description: 'Close the distance behind the knives, wind chakra lengthening the edges.',
    discipline: 'taijutsu',
    school: 'Wind Blade',
    element: 'wind',
    reach: ['close', 'mid'],
    needs: { weapon: 'knuckles' },
    effects: [
      { verb: 'move', to: 'close', power: 6 },
      { verb: 'damage', power: 12 },
    ],
    chakraCost: 7,
    rank: 'D',
    difficulty: 60,
  },
  {
    id: 'wind-blade-flurry',
    name: 'Wind Blade Flurry',
    description: 'Three cuts from the knives and three more from the wind around them.',
    discipline: 'taijutsu',
    school: 'Wind Blade',
    element: 'wind',
    needs: { weapon: 'knuckles' },
    effects: [
      { verb: 'damage', power: 18, hits: 3 },
      { verb: 'afflict', power: 6, harm: 'bleed' },
    ],
    chakraCost: 13,
    rank: 'B',
    difficulty: 115,
  },
];
