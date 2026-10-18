import type { Slip } from './hygiene';
import type { Habit } from './style';

/**
 * Where the prose stands, as the lint's budget (`lint.test.ts`): counts of slips in the
 * goldens, and each pack's style (shares out of one, habits per thousand words). A pass that
 * improves a number lowers it here in the same change.
 */

interface StyleBudget {
  /** A floor: sentences may only grow longer on average. */
  readonly meanSentence: number;
  readonly shortShare: number;
  readonly quipShare: number;
  readonly per1k: Readonly<Record<Habit, number>>;
}

export const PROSE_BUDGET: {
  readonly slips: Readonly<Record<Slip, number>>;
  readonly style: Readonly<Record<'original' | 'naruto', StyleBudget>>;
} = {
  // The first-hours goldens run eight days (two weekly lessons), so their counts cover more.
  slips: {
    unfilledSlot: 0,
    oneAsPlural: 0,
    zeroChip: 0,
    fractionChip: 0,
    straightQuote: 0,
    repeatedLine: 58,
  },
  style: {
    original: {
      meanSentence: 8.5,
      shortShare: 0.28,
      quipShare: 0.22,
      per1k: {
        gesture: 1.3,
        triple: 2,
        colon: 0.6,
        vagueSomething: 1.1,
        stockAtmosphere: 0.4,
        notButReversal: 0,
        emDash: 0,
      },
    },
    naruto: {
      meanSentence: 7.9,
      shortShare: 0.3,
      quipShare: 0.23,
      per1k: {
        gesture: 1.5,
        triple: 1.7,
        colon: 0.5,
        vagueSomething: 0.9,
        stockAtmosphere: 0.2,
        notButReversal: 0,
        emDash: 0,
      },
    },
  },
};
