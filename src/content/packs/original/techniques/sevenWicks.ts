import type { TechniqueDef } from '@/systems/techniques';

/**
 * The Seven Wicks: Lantern Wind's inner fire as a ladder (`systems/techniques/ladders.ts`). The
 * body's inner lamps are lit one at a time, each burning hotter at the body's cost (the wicks'
 * toll, `combat/rules/verbs/tolls.ts`): Kindled Pulse lights the first three, the Marrow Wick the
 * sixth, and Every Lantern Lit the seventh, after which the body goes dark. Kindled Pulse and
 * Every Lantern Lit live in the taijutsu file; these are the rest of it, taught by Lantern Wind's
 * teachers.
 */

const THIRD_WICK = { ladder: 'wicks', step: 3 } as const;

export const SEVEN_WICKS: readonly TechniqueDef[] = [
  {
    id: 'white-flame-heel',
    name: 'White-Flame Heel',
    description:
      'With three wicks lit the heel comes round twice before the eye can follow it once, and the second throws them clear.',
    discipline: 'taijutsu',
    school: 'Lantern Wind',
    needsOpen: THIRD_WICK,
    reach: ['close'],
    effects: [
      { verb: 'damage', power: 22, hits: 2 },
      { verb: 'knock', power: 8, to: 'mid' },
    ],
    chakraCost: 11,
    rank: 'B',
    difficulty: 105,
  },
  {
    id: 'marrow-wick',
    name: 'Marrow Wick',
    description:
      'Light the sixth wick, down in the marrow. The bones run hot, the blood runs thin, and the body is something else until it gutters.',
    discipline: 'taijutsu',
    school: 'Lantern Wind',
    effects: [
      {
        verb: 'empower',
        power: 22,
        boosts: ['strength', 'speed', 'taijutsu', 'stamina'],
        afterCost: { kind: 'injury', stat: 'stamina', amount: 2, days: 4 },
        opens: { ladder: 'wicks', step: 6 },
      },
    ],
    chakraCost: 14,
    rank: 'A',
    difficulty: 135,
  },
];
