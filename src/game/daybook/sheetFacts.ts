import type { Fact, FactOf } from '../facts/types';

/**
 * Which facts the day's sheet tells. The sheet's wounds and jobs are the day's facts of those
 * kinds, never a comparison of dawn with night: an injury whose days a meal or a talent changed
 * is the same injury, and only a new one is a wound. A new kind of fact is asked about here.
 */

export type SheetFact = FactOf<'injuryAdded'> | FactOf<'jobDone'>;

export function onTheSheet(fact: Fact): fact is SheetFact {
  switch (fact.kind) {
    case 'injuryAdded':
    case 'jobDone':
      return true;
    // At-hand slots are for your sensei to judge.
    case 'atHand':
      return false;
  }
}
