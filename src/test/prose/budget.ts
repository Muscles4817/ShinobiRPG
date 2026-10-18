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
      meanSentence: 9.5,
      shortShare: 0.25,
      quipShare: 0.22,
      per1k: {
        gesture: 0.1,
        triple: 1.6,
        colon: 0.2,
        vagueSomething: 0.3,
        stockAtmosphere: 0.1,
        notButReversal: 0,
        emDash: 0,
      },
    },
    naruto: {
      meanSentence: 9,
      shortShare: 0.27,
      quipShare: 0.21,
      per1k: {
        gesture: 0.2,
        triple: 1.1,
        colon: 0.2,
        vagueSomething: 0.2,
        stockAtmosphere: 0.1,
        notButReversal: 0,
        emDash: 0,
      },
    },
  },
};
