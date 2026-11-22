import { noteArrival } from '../atlas';
import { noteDayEnd } from '../daybook/record';
import { promotionsEarned } from '../exam/promotion';
import { promotionHeld, promotionMissed } from '../exam/promotionDay';
import { noteFieldBook } from '../fieldBook/rewards';
import { noteFight } from '../fightRecord';
import { noteGradeUps } from '../gradeUps';
import { giftsFoundAtTheDoor, giftsGiven } from '../home/gifts';
import { notePuppetsLearned } from '../puppetry/keeping';
import { rivalApart, rivalChosen, rivalDayTurned, rivalPerson, rivalScored } from '../rival/record';
import { curriculumAfter, curriculumBefore } from '../sensei/curriculum';
import { flushMentorNotices } from '../sensei/settle';
import { noteNewMoves } from '../style';
import { AT_HOME, FREE, OFF_DUTY } from './needs';
import type { GameAction } from '../actions/types';
import type { Happening, Moment, Need } from './types';

/**
 * What happens around each action, in the order it happens (`dispatch` runs these lists; the
 * order test pins them). Before the action, your sensei may show you the thing first; after it,
 * everything that follows from what changed. A happening that reaches you needs you where it can;
 * one that only reads what you did (a grade reached, a page filled) needs nothing.
 */

/** Around an action: the action too. (Kept here, apart from `types.ts`, so what passes time
 * never imports the actions.) */
export interface ActionMoment extends Moment {
  readonly action: GameAction;
}

type ActionHappening = Happening<ActionMoment>;

const WITH_RIVAL: Need = { kind: 'with', who: 'your rival', person: rivalPerson };

export const BEFORE_ACTION: readonly ActionHappening[] = [
  {
    id: 'sensei-shows-first',
    needs: [AT_HOME, OFF_DUTY],
    run: ({ now, action, ctx }) => curriculumBefore(now, action, ctx),
  },
];

export const AFTER_ACTION: readonly ActionHappening[] = [
  { id: 'sensei-notices', needs: [], run: ({ now }) => flushMentorNotices(now) },
  {
    id: 'sensei-sees-you-fed',
    needs: [AT_HOME, OFF_DUTY],
    run: ({ now, ctx }) => curriculumAfter(now, ctx),
  },
  {
    id: 'grades-reached',
    needs: [],
    run: ({ before, now, ctx }) => noteGradeUps(before, now, ctx),
  },
  {
    // Held on its day at home; away, it goes ahead without you. Busy at home, it waits.
    id: 'promotion-day',
    needs: [AT_HOME, FREE],
    run: ({ now }) => promotionHeld(now),
    otherwise: ({ now, ctx }, unmet) =>
      unmet.includes('atHome') ? promotionMissed(now, ctx) : now,
  },
  { id: 'promotion-earned', needs: [FREE], run: ({ now, ctx }) => promotionsEarned(now, ctx) },
  { id: 'rival-firsts', needs: [], run: ({ now, ctx }) => rivalScored(now, ctx) },
  {
    // Apart, nothing is made, and a challenge standing lapses at no cost.
    id: 'rival-day',
    needs: [WITH_RIVAL],
    run: ({ before, now, ctx }) => rivalDayTurned(before, now, ctx),
    otherwise: ({ now }) => rivalApart(now),
  },
  { id: 'rival-chosen', needs: [], run: ({ now, ctx }) => rivalChosen(now, ctx) },
  // Each friend's gift is handed over or left at the door by whether they can find you.
  { id: 'gift-given', needs: [], run: ({ now, ctx }) => giftsGiven(now, ctx) },
  {
    id: 'gifts-at-the-door',
    needs: [AT_HOME, OFF_DUTY],
    run: ({ now, ctx }) => giftsFoundAtTheDoor(now, ctx),
  },
  {
    id: 'puppets-learned',
    needs: [],
    run: ({ before, now, ctx }) => notePuppetsLearned(before, now, ctx),
  },
  {
    id: 'field-book-page',
    needs: [],
    run: ({ before, now, ctx }) => noteFieldBook(before, now, ctx),
  },
  { id: 'new-moves', needs: [], run: ({ before, now, ctx }) => noteNewMoves(before, now, ctx) },
  { id: 'arrived', needs: [], run: ({ before, now, ctx }) => noteArrival(before, now, ctx) },
  { id: 'day-ended', needs: [], run: ({ before, now, action }) => noteDayEnd(before, now, action) },
  {
    id: 'fight-recorded',
    needs: [],
    run: ({ before, now, action, ctx }) => noteFight(before, now, action, ctx),
  },
];
