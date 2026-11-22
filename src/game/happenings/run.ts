import type { GameState } from '../state';
import { unmetNeeds } from './needs';
import type { Happening, HappeningTrace, Moment, TimeHappening, TimeMoment } from './types';

/**
 * The sequencer: runs a list of happenings in its order, each on the state the last one left,
 * each only if its needs hold (else its `otherwise`, told what was missing). A trace, when asked
 * for, records every happening's turn, so a test can see what ran and what was held back.
 */

export function sequence<M extends Moment>(
  list: readonly Happening<M>[],
  moment: M,
  trace?: HappeningTrace[],
): GameState {
  return list.reduce((now, happening) => {
    const at = { ...moment, now };
    const unmet = unmetNeeds(now, moment.ctx, happening.needs);
    trace?.push({ id: happening.id, ran: unmet.length === 0, unmet });
    if (unmet.length === 0) return happening.run(at);
    return happening.otherwise ? happening.otherwise(at, unmet) : now;
  }, moment.now);
}

/** How many times a time happening runs in a stretch that ended `days` days. */
function timesIn(happening: TimeHappening, days: number): number {
  switch (happening.every) {
    case 'stretch':
      return 1;
    case 'newDay':
      return days > 0 ? 1 : 0;
    case 'eachDay':
      return days;
  }
}

/** Time passing: each happening in order, as often as its cadence says for this stretch. */
export function sequenceTime(
  list: readonly TimeHappening[],
  moment: TimeMoment,
  trace?: HappeningTrace[],
): GameState {
  return list.reduce((now, happening) => {
    let state = now;
    for (let time = 0; time < timesIn(happening, moment.days); time++) {
      state = sequence([happening], { ...moment, now: state }, trace);
    }
    return state;
  }, moment.now);
}
