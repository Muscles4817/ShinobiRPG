import { boardFor } from '../board';
import { companionsDayPassed } from '../companions/routine';
import { dustDayPassed } from '../dust/keeping';
import { hiveDayPassed } from '../hives/keeping';
import { settleHunt } from '../hunt';
import { healInjuries } from '../injuries';
import { peopleGrown } from '../people/progress';
import { settleMentor } from '../sensei/settle';
import { noteWhereabouts } from '../sensei/whereabouts';
import { OFF_DUTY } from './needs';
import type { TimeHappening } from './types';

/**
 * What happens as time passes (`spendTime` runs this list), in order, each as often as its
 * cadence says: whenever time passes, once on a new day (those that catch up the days they missed
 * themselves, by a day kept on their slice), or once for every day that ended.
 */
export const TIME_PASSING: readonly TimeHappening[] = [
  {
    // First, as the slots pass: what was true on each is what your sensei settles it by. It
    // reaches nobody; whether you were at hand is the sensei's own rule (`atHand`).
    id: 'whereabouts-noted',
    every: 'stretch',
    needs: [],
    run: ({ before, now, ctx }) => noteWhereabouts(before, now, ctx),
  },
  { id: 'wounds-mend', every: 'newDay', needs: [], run: ({ now, ctx }) => healInjuries(now, ctx) },
  {
    id: 'peers-train',
    every: 'newDay',
    needs: [],
    run: ({ now, ctx }) => ({ ...now, people: peopleGrown(now, ctx) }),
  },
  {
    id: 'companion-routine',
    every: 'stretch',
    needs: [],
    run: ({ now, ctx }) => companionsDayPassed(now, ctx),
  },
  {
    id: 'hive-breeds',
    every: 'eachDay',
    needs: [],
    run: ({ now, ctx }) => hiveDayPassed(now, ctx),
  },
  {
    id: 'dust-gathers',
    every: 'eachDay',
    needs: [],
    run: ({ now, ctx }) => dustDayPassed(now, ctx),
  },
  {
    id: 'sensei-settles',
    every: 'newDay',
    needs: [],
    run: ({ now, ctx }) => settleMentor(now, ctx),
  },
  {
    // Days on the road or on a job are counted by the trip or not at all.
    id: 'hunt-settles',
    every: 'eachDay',
    needs: [OFF_DUTY],
    run: ({ now, ctx }) => settleHunt(now, ctx),
  },
  {
    id: 'board-posts',
    every: 'stretch',
    needs: [],
    run: ({ now, ctx }) => ({ ...now, board: boardFor(now, ctx) }),
  },
];
