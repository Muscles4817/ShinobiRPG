import { signPass } from '@/systems/travel';
import { act, ctx, newGame } from '@/test/gameFixtures';

import type { GameState } from '../state';
import { AFTER_ACTION, BEFORE_ACTION, TIME_PASSING } from './index';
import { AT_HOME, FREE } from './needs';
import { sequence, sequenceTime } from './run';
import type { ActionMoment } from './aroundActions';
import type { Happening, HappeningTrace, TimeHappening } from './types';

/** The happenings: their declared order, the sequencer's rules, and that nothing reaches you
 * where you aren't. */

const AWAY = 'port-shiomachi';

describe('the order things happen in', () => {
  // A reorder changes what follows from what: it should show in review, so it is pinned here.
  it('is declared, and this is it', () => {
    expect(BEFORE_ACTION.map((h) => h.id)).toEqual(['sensei-shows-first']);
    expect(AFTER_ACTION.map((h) => h.id)).toEqual([
      'sensei-notices',
      'sensei-sees-you-fed',
      'grades-reached',
      'promotion-day',
      'promotion-earned',
      'rival-firsts',
      'rival-day',
      'rival-chosen',
      'gift-given',
      'gifts-at-the-door',
      'puppets-learned',
      'field-book-page',
      'new-moves',
      'arrived',
      'day-ended',
      'fight-recorded',
    ]);
    expect(TIME_PASSING.map((h) => `${h.id}:${h.every}`)).toEqual([
      'whereabouts-noted:stretch',
      'wounds-mend:newDay',
      'peers-train:newDay',
      'companion-routine:stretch',
      'hive-breeds:eachDay',
      'dust-gathers:eachDay',
      'sensei-settles:newDay',
      'hunt-settles:eachDay',
      'board-posts:stretch',
    ]);
  });

  it('names every happening once', () => {
    const ids = [...BEFORE_ACTION, ...AFTER_ACTION, ...TIME_PASSING].map((h) => h.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('the sequencer', () => {
  const marked = (mark: string) => (s: GameState) => ({ ...s, packId: `${s.packId}+${mark}` });
  const moment = (now: GameState): ActionMoment => ({
    ctx,
    before: now,
    now,
    action: { type: 'setDayEnd', mode: 'full' },
  });

  it('runs a happening only where its needs hold, else what it says instead, told why', () => {
    const told: string[][] = [];
    const happening: Happening<ActionMoment> = {
      id: 'test',
      needs: [AT_HOME, FREE],
      run: ({ now }) => marked('ran')(now),
      otherwise: ({ now }, unmet) => {
        told.push([...unmet]);
        return marked('instead')(now);
      },
    };
    const home = newGame();
    expect(sequence([happening], moment(home)).packId).toMatch(/\+ran$/);
    const away = { ...home, locationId: AWAY };
    const trace: HappeningTrace[] = [];
    expect(sequence([happening], moment(away), trace).packId).toMatch(/\+instead$/);
    expect(told).toEqual([['atHome']]);
    expect(trace).toEqual([{ id: 'test', ran: false, unmet: ['atHome'] }]);
  });

  it('runs each in order, on what the one before left', () => {
    const list = ['a', 'b', 'c'].map((id) => ({
      id,
      needs: [],
      run: ({ now }: ActionMoment) => marked(id)(now),
    }));
    expect(sequence(list, moment(newGame())).packId).toMatch(/\+a\+b\+c$/);
  });

  it('runs time happenings as often as their cadence says', () => {
    const cadenced = (every: TimeHappening['every']): TimeHappening => ({
      id: every,
      every,
      needs: [],
      run: ({ now }) => marked(every)(now),
    });
    const list = [cadenced('stretch'), cadenced('newDay'), cadenced('eachDay')];
    const game = newGame();
    const count = (days: number) =>
      sequenceTime(list, { ctx, before: game, now: game, days }).packId.split('+').slice(1);
    expect(count(0)).toEqual(['stretch']);
    expect(count(3)).toEqual(['stretch', 'newDay', 'eachDay', 'eachDay', 'eachDay']);
  });
});

/** Settled in another town: a genin there on their sensei's pass. */
function inAnotherTown(): GameState {
  const genin = newGame();
  const start = { ...genin, leave: signPass(genin.leave, genin.time.day, 60) };
  const going = act(start, { type: 'travel', locationId: AWAY, quick: true });
  const there = going.mission ? act(going, { type: 'missionDecide', optionIndex: 0 }) : going;
  expect(there.locationId).toBe(AWAY);
  return { ...there, wallet: { ryo: 100_000 } };
}

describe('nothing reaches you where you aren’t', () => {
  it('in a month in another town: no rival’s challenge or needling, no ceremony', () => {
    const there = inAnotherTown();
    // Everything primed to reach you: a rival due a challenge, a promotion due.
    let state: GameState = {
      ...there,
      rival: there.rival && { ...there.rival, lastChallengeDay: -100, challenge: null, beat: null },
      exams: {
        ...there.exams,
        promotionDay: {
          ceremony: { rank: 'chunin', route: 'sensei' },
          day: there.time.day + 2,
          missed: false,
        },
      },
    };
    for (let night = 0; night < 30; night++) {
      state = act(state, { type: 'takeRoom' });
      expect(state.rival?.challenge ?? null).toBeNull();
      expect(state.rival?.beat ?? null).toBeNull();
      expect(state.exams.ceremony).toBeNull();
      expect(state.locationId).toBe(AWAY);
    }
    expect(state.exams.promotionDay?.missed).toBe(true);
  });
});
