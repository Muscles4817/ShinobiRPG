import type { TechniqueDef } from '@/systems/techniques';

/**
 * More of the plain taijutsu every village drills, so a striker's repertoire and chains have
 * choices at each grade: an elbow and a backfist to open with, a hip throw and a whirlwind kick,
 * a pressure-point strike, a combo that ends in a stagger, and at the top a barrage for an open
 * foe and a throw that shakes the ground. All are body moves, paid in breath.
 */
export const TAIJUTSU_VARIANTS: readonly TechniqueDef[] = [
  {
    id: 'short-elbow-strike',
    name: 'Elbow Strike',
    description:
      'A short elbow from inside the guard, too close and too quick for an arm to come up in time.',
    discipline: 'taijutsu',
    accuracy: 'sure',
    effects: [{ verb: 'damage', power: 9 }],
    chakraCost: 2,
    rank: 'E',
    difficulty: 25,
  },
  {
    id: 'spinning-backfist',
    name: 'Spinning Backfist',
    description:
      'Turn your back on them for half a heartbeat and come round with the back of the fist, a gamble that hits hard when it lands.',
    discipline: 'taijutsu',
    accuracy: 'wild',
    effects: [{ verb: 'damage', power: 17 }],
    chakraCost: 5,
    rank: 'D',
    difficulty: 50,
  },
  {
    id: 'knee-hook-pull',
    name: 'Knee-Hook Pull',
    description:
      'Hook a foot behind their knee from a stride off and pull, so they stumble in onto your fist.',
    discipline: 'taijutsu',
    reach: ['close', 'mid'],
    effects: [
      { verb: 'knock', power: 6, to: 'close' },
      { verb: 'damage', power: 10 },
    ],
    chakraCost: 6,
    rank: 'D',
    difficulty: 55,
  },
  {
    id: 'hip-throw',
    name: 'Hip Throw',
    description:
      'Load them onto your hip, turn, and let go at the top of the arc so they land well across the field.',
    discipline: 'taijutsu',
    reach: ['close'],
    effects: [
      { verb: 'damage', power: 14 },
      { verb: 'knock', power: 8, to: 'far' },
    ],
    chakraCost: 8,
    rank: 'C',
    difficulty: 80,
  },
  {
    id: 'whirlwind-kick',
    name: 'Whirlwind Kick',
    description:
      'A low spinning kick that sweeps round in a full circle and takes out the legs of anyone standing in it.',
    discipline: 'taijutsu',
    reach: ['close'],
    effects: [{ verb: 'area', power: 12 }],
    chakraCost: 8,
    rank: 'C',
    difficulty: 75,
  },
  {
    id: 'pressure-point-strike',
    name: 'Pressure-Point Strike',
    description:
      'Two stiff fingers into the nerve under the collarbone or behind the knee, which leaves a limb dead for a breath or two.',
    discipline: 'taijutsu',
    accuracy: 'sure',
    reach: ['close'],
    effects: [
      { verb: 'damage', power: 10 },
      { verb: 'daze', power: 14 },
    ],
    chakraCost: 10,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'axe-kick-combo',
    name: 'Axe-Kick Combo',
    description:
      'Three kicks that roll into one another and end with a heel brought down on the crown of the head.',
    discipline: 'taijutsu',
    effects: [
      { verb: 'damage', power: 22, hits: 3 },
      { verb: 'daze', power: 6 },
    ],
    chakraCost: 12,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'hundred-fist-barrage',
    name: 'Hundred-Fist Barrage',
    description:
      'Fists on a foe who can’t defend, so many and so fast that the last ones land while the first are still being felt.',
    discipline: 'taijutsu',
    // Nobody standing ready takes a hundred blows: it waits for an opening.
    needsTarget: 'open',
    reach: ['close'],
    effects: [
      { verb: 'damage', power: 30, hits: 5 },
      { verb: 'daze', power: 8 },
    ],
    chakraCost: 16,
    rank: 'A',
    difficulty: 135,
  },
  {
    id: 'ground-breaker-throw',
    name: 'Ground-Breaker Throw',
    description:
      'Lift them clean off their feet and drive them into the ground hard enough to crack it, then let the rebound throw them clear.',
    discipline: 'taijutsu',
    reach: ['close'],
    effects: [
      { verb: 'damage', power: 22 },
      { verb: 'knock', power: 10, to: 'far' },
      { verb: 'daze', power: 8 },
    ],
    chakraCost: 16,
    rank: 'A',
    difficulty: 135,
  },
];
