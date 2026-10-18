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
  slips: {
    unfilledSlot: 0,
    oneAsPlural: 0,
    zeroChip: 6,
    fractionChip: 24,
    straightQuote: 16,
    repeatedLine: 32,
  },
  style: {
    original: {
      meanSentence: 8.2,
      shortShare: 0.31,
      quipShare: 0.29,
      per1k: {
        gesture: 2.1,
        triple: 2.3,
        colon: 1.1,
        vagueSomething: 1.5,
        stockAtmosphere: 0.5,
        notButReversal: 0,
        emDash: 0,
      },
    },
    naruto: {
      meanSentence: 7.6,
      shortShare: 0.34,
      quipShare: 0.29,
      per1k: {
        gesture: 2.4,
        triple: 2,
        colon: 1.1,
        vagueSomething: 1.4,
        stockAtmosphere: 0.2,
        notButReversal: 0,
        emDash: 0.1,
      },
    },
  },
};
