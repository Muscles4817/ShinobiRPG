import { CONTENT_PACKS } from '@/content';
import type { LedgerLine, MissionRun } from '@/systems/missions';
import { act, ctx, newGame, postEverything, veteran } from '@/test/gameFixtures';

import { createGameContext } from './context';
import { NOMINATION_MISSIONS } from './exam/entry';

import {
  afterFieldWork,
  SENSEI_RECOMMENDATION_DAYS,
  SENSEI_RECOMMENDATION_REGARD,
} from './exam/routes';
import type { GameState } from './state';
import { promotionScene } from './views/promotion';

/** The roads to chūnin beside the exam: a field promotion, an arc's patron, a sensei's word. */

/** Stats a sensei calls ready: one at chūnin grade (C), two more at D. */
function ready(state: GameState): GameState {
  const stats = { ...state.character.stats, taijutsu: 14, strength: 9, speed: 9 };
  return { ...state, character: { ...state.character, stats } };
}

/** A run of the standing patrol, with its ledger as given: clean when nothing went wrong. */
function patrolRun(state: GameState, setback = false): MissionRun {
  const started = act(postEverything(state), { type: 'startMission', missionId: 'lantern-patrol' });
  const run = started.mission;
  if (!run) throw new Error('The patrol did not start.');
  const lost: LedgerLine = { stageIndex: 0, text: 'A lamp was lost.', tone: 'cost' };
  const ledger = setback ? [lost] : [];
  return { ...run, ledger };
}

describe('a field promotion', () => {
  const weir = ctx.content.missions.require('smugglers-at-the-weir');
  const patrol = ctx.content.missions.require('lantern-patrol');

  it('raises a ready genin who does an outstanding job cleanly', () => {
    const state = ready(newGame());
    const raised = afterFieldWork(state, ctx, weir, patrolRun(state));
    expect(raised.exams.ceremony).toEqual({
      rank: 'chunin',
      route: 'field',
      missionId: weir.id,
    });
    expect(promotionScene(raised, ctx)?.speech).toContain(weir.title);
  });

  it('wants the job outstanding, the work clean and the genin ready', () => {
    const state = ready(newGame());
    expect(afterFieldWork(state, ctx, patrol, patrolRun(state)).exams.ceremony).toBeNull();
    expect(afterFieldWork(state, ctx, weir, patrolRun(state, true)).exams.ceremony).toBeNull();
    const green = newGame();
    expect(afterFieldWork(green, ctx, weir, patrolRun(green)).exams.ceremony).toBeNull();
  });
});

describe('an arc’s recommendation', () => {
  const arc = ctx.content.arcs.require('the-lantern-thief');
  const allDone = arc.acts.flatMap((a) => a.jobs);

  function finished(state: GameState): GameState {
    return { ...state, board: { ...state.board, completed: [...allDone] } };
  }

  it('puts a ready genin forward once the arc is done, in its patron’s words', () => {
    const after = act(finished(ready(newGame())), { type: 'setDayEnd', mode: 'brief' });
    expect(after.exams.ceremony).toEqual({ rank: 'chunin', route: 'arc', arcId: arc.id });
    expect(promotionScene(after, ctx)?.speech).toContain('Night Watch');
    const raised = act(after, { type: 'acceptPromotion' });
    expect(raised.standing.rank).toBe('chunin');
  });

  it('waits until the arc is done and the genin is ready', () => {
    const unfinished = {
      ...ready(newGame()),
      board: { ...newGame().board, completed: allDone.slice(0, -1) },
    };
    expect(act(unfinished, { type: 'setDayEnd', mode: 'brief' }).exams.ceremony).toBeNull();
    expect(
      act(finished(newGame()), { type: 'setDayEnd', mode: 'brief' }).exams.ceremony,
    ).toBeNull();
  });
});

describe('a sensei’s recommendation', () => {
  /**
   * A year and a week on, on the same weekday as the first lesson, every meeting kept to date:
   * the second spring's exam is just past, the next a season away.
   */
  const DAY = SENSEI_RECOMMENDATION_DAYS + 8;
  /** A week earlier, with the spring exam six days away. */
  const EXAM_WEEK = SENSEI_RECOMMENDATION_DAYS + 1;

  function yearOn(senseiId: string, regard = SENSEI_RECOMMENDATION_REGARD): GameState {
    const base = veteran(ready(newGame()), NOMINATION_MISSIONS.late);
    const team = base.people.team!;
    return {
      ...base,
      time: { day: DAY, slot: 0 },
      mentor: { ...base.mentor, regard, settledDay: DAY - 1 },
      people: {
        ...base.people,
        team: { ...team, senseiId },
        bonds: { ...base.people.bonds, [senseiId]: { points: 40, lastTalkDay: null, heard: [] } },
      },
    };
  }

  const lesson = (personId: string) =>
    ({ type: 'trainWith', personId, statId: 'taijutsu' }) as const;

  it('comes after a lesson, a year on, from a sensei who rates you highly', () => {
    const after = act(yearOn('goran'), lesson('goran'));
    expect(after.exams.ceremony).toEqual({ rank: 'chunin', route: 'sensei' });
    expect(promotionScene(after, ctx)?.speech).toContain('Gōran');
  });

  it('waits for the year and the regard', () => {
    const early = { ...yearOn('goran'), time: { day: SENSEI_RECOMMENDATION_DAYS - 6, slot: 0 } };
    const tooEarly = { ...early, mentor: { ...early.mentor, settledDay: early.time.day - 1 } };
    expect(act(tooEarly, lesson('goran')).exams.ceremony).toBeNull();
    const lukewarm = yearOn('goran', SENSEI_RECOMMENDATION_REGARD - 5);
    expect(act(lukewarm, lesson('goran')).exams.ceremony).toBeNull();
  });

  it('waits for the exam instead when one is days away', () => {
    const state = yearOn('goran');
    const examWeek = {
      ...state,
      time: { day: EXAM_WEEK, slot: 0 },
      mentor: { ...state.mentor, settledDay: EXAM_WEEK - 1 },
    };
    expect(act(examWeek, lesson('goran')).exams.ceremony).toBeNull();
  });

  it('never comes from a sensei who holds students back', () => {
    const original = CONTENT_PACKS.find((p) => p.id === 'original')!;
    const holdsBack = createGameContext({
      ...original,
      people: original.people.map((p) =>
        p.id === 'goran' && p.sensei?.ways
          ? {
              ...p,
              sensei: {
                ...p.sensei,
                ways: {
                  ...p.sensei.ways,
                  gatekeeping: { ...p.sensei.ways.gatekeeping, nominates: 'late' as const },
                },
              },
            }
          : p,
      ),
    });
    expect(act(yearOn('goran'), lesson('goran'), holdsBack).exams.ceremony).toBeNull();
  });
});
