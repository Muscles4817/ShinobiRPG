import type { TechniqueDef } from '@/systems/techniques';

/**
 * Finishers: the payoff of a set-up. Killing blows (`lethal`) go through a guard and hit to
 * kill on a foe who can't see their user or can't move (`combat/rules/lethal.ts`), so a fighter
 * who hides and holds first has a reason to; Lantern Fall waits for a foe left open, dazed or
 * held (`needsTarget`). The archive keeps the standard ones (the restricted stacks and the
 * sealed archive); the Last Moth is the Night Watch's, taught by Moth Needle's teacher.
 */
export const FINISHERS: readonly TechniqueDef[] = [
  {
    id: 'lantern-fall',
    name: 'Lantern Fall',
    description:
      'Catch a reeling foe under the arms, carry them up like a lantern on its pole, and bring them down head first.',
    discipline: 'taijutsu',
    // Nobody standing ready lets themselves be lifted: it waits for an opening.
    needsTarget: 'open',
    reach: ['close'],
    effects: [
      { verb: 'damage', power: 26 },
      { verb: 'knock', power: 6, to: 'mid' },
    ],
    chakraCost: 12,
    rank: 'B',
    difficulty: 110,
  },
  {
    id: 'last-moth',
    name: 'The Last Moth',
    description:
      'One needle-fingered strike to the heart’s chakra point, the way the Night Watch end a fight nobody saw begin.',
    discipline: 'taijutsu',
    school: 'Moth Needle',
    moulded: true,
    // Made for a foe who never sees the hand, or can't move away from it.
    lethal: true,
    accuracy: 'sure',
    reach: ['close'],
    effects: [{ verb: 'damage', power: 20 }],
    chakraCost: 14,
    rank: 'B',
    difficulty: 115,
  },
  {
    id: 'quenching-thrust',
    name: 'Quenching Thrust',
    description:
      'Straight in to the hilt, the way a smith plunges a blade into the trough, at a foe who can’t see it or can’t step aside.',
    discipline: 'kenjutsu',
    needs: { weapon: 'blade' },
    lethal: true,
    reach: ['close'],
    effects: [{ verb: 'damage', power: 26 }],
    chakraCost: 16,
    rank: 'A',
    difficulty: 135,
  },
  {
    id: 'pinched-flame',
    name: 'Pinched Flame',
    description:
      'Chakra pressed to a point between two fingers and put out inside the foe, the way a lamplighter pinches out a wick.',
    discipline: 'ninjutsu',
    lethal: true,
    reach: ['close'],
    effects: [{ verb: 'damage', power: 24, scaling: { drive: ['ninjutsu', 'chakraControl'] } }],
    chakraCost: 18,
    rank: 'B',
    difficulty: 115,
  },
];
