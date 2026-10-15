import { stageOf } from '@/systems/bonds';
import { createStats } from '@/systems/stats';
import { EXAM_DAY, examDay } from '@/test/examFixtures';
import { act, ctx } from '@/test/gameFixtures';

import { blockerFor } from './dispatch';
import { examAnnounced, examRumours, examToday, nextSitting } from './exam/calendar';
import {
  nominationMissions,
  readinessGap,
  senseiOf,
  REPLACEMENT_BOND_HIT,
  REPLACEMENT_STAGE,
} from './exam/entry';
import type { GameState } from './state';
import { hubView } from './views/hub';
import { examNotice } from './views/examNotice';
import { rumoursToday } from './village';

/** The exam calendar and who may sit: nomination, a record, and a team of three. */

const ENTER = { type: 'enterExam' } as const;

function withSensei(state: GameState, senseiId: string): GameState {
  const team = state.people.team;
  if (!team) return state;
  const bonds = { ...state.people.bonds, [senseiId]: { points: 40, lastTalkDay: null, heard: [] } };
  return { ...state, people: { ...state.people, team: { ...team, senseiId }, bonds } };
}

/** The first teammate, held back: their stats still a fresh graduate's. */
function teammateNotReady(state: GameState): { state: GameState; id: string } {
  const id = state.people.team?.teammateIds[0] ?? '';
  const progress = {
    ...state.people.progress,
    [id]: { stats: createStats(5), lastGrownDay: EXAM_DAY },
  };
  return { state: { ...state, people: { ...state.people, progress } }, id };
}

/** Another genin who is your friend and ready. */
function friendReady(state: GameState): { state: GameState; id: string } {
  const team = new Set(state.people.team?.teammateIds ?? []);
  const friend = ctx.content.people.all.find((p) => p.role === 'genin' && !team.has(p.id));
  const id = friend?.id ?? '';
  const people = {
    ...state.people,
    progress: {
      ...state.people.progress,
      [id]: { stats: createStats(14), lastGrownDay: EXAM_DAY },
    },
    bonds: { ...state.people.bonds, [id]: { points: 35, lastTalkDay: null, heard: [] } },
  };
  return { state: { ...state, people }, id };
}

describe('the exam calendar', () => {
  it('holds the exam twice a year and talks about it the week before', () => {
    const before = { ...examDay(), time: { day: EXAM_DAY - 3, slot: 0 } };
    expect(nextSitting(before, ctx)?.daysAway).toBe(3);
    expect(examToday(before, ctx)).toBeNull();
    expect(examAnnounced(before, ctx)?.exam.id).toBe('lantern-trials');
    expect(rumoursToday(before, ctx).map((r) => r.id)).toContain('exam-lantern-trials');
    const long = { ...before, time: { day: EXAM_DAY - 20, slot: 0 } };
    expect(examAnnounced(long, ctx)).toBeNull();
    expect(examRumours(long, ctx)).toEqual([]);
  });

  it('puts the exam on the mission hall card and its notice on the board', () => {
    const state = examDay();
    expect(examToday(state, ctx)?.name).toBe('The Lantern Trials');
    expect(hubView(state, ctx).places.find((p) => p.kind === 'missions')?.badge).toBe('Exam today');
    const notice = examNotice(state, ctx);
    expect(notice?.when).toBe('Today');
    expect(notice?.sensei?.nominated).toBe(true);
    expect(notice?.entries[0]?.blocker).toBeNull();
  });

  it('is not for a chūnin', () => {
    const state = examDay();
    const chunin = { ...state, standing: { ...state.standing, rank: 'chunin' as const } };
    expect(nextSitting(chunin, ctx)).toBeNull();
  });
});

describe('nomination', () => {
  it('needs the sensei’s trust, their judgement and a record of jobs', () => {
    const ready = examDay();
    const senseiId = ready.people.team?.senseiId ?? '';
    const strangers = {
      ...ready,
      people: {
        ...ready.people,
        bonds: { ...ready.people.bonds, [senseiId]: { points: 0, lastTalkDay: null, heard: [] } },
      },
    };
    expect(blockerFor(strangers, ENTER, ctx)).toMatch(/doesn’t know you well enough/);
    const green = { ...ready, character: { ...ready.character, stats: createStats(9) } };
    expect(blockerFor(green, ENTER, ctx)).toMatch(
      /doesn’t think you’re ready. You need a stat at chūnin grade/,
    );
    const fresh = { ...ready, standing: { ...ready.standing, missionsCompleted: 3 } };
    const wanted = nominationMissions(senseiOf(fresh, ctx)!);
    expect(blockerFor(fresh, ENTER, ctx)).toMatch(`${wanted} jobs done, you have 3`);
  });

  it('a sensei who puts students forward early wants fewer jobs than one who waits', () => {
    const sensei = (id: string) => ctx.content.people.require(id);
    expect(nominationMissions(sensei('goran'))).toBeLessThan(nominationMissions(sensei('tetsu')));
    expect(nominationMissions(sensei('tetsu'))).toBeLessThan(nominationMissions(sensei('yomi')));
  });

  it('judges readiness on grades: some at C and a rounded base', () => {
    // A D in everything is not enough: someone has to be good at something.
    expect(readinessGap(createStats(12))).toMatch(/chūnin grade/);
    expect(readinessGap(createStats(5, { taijutsu: 10, speed: 4 }))).toMatch(/3 stats at D/);
    expect(readinessGap(createStats(8, { taijutsu: 6 }))).toBeNull();
  });

  it('is entered at the mission hall, on the day, once', () => {
    const state = examDay();
    expect(blockerFor({ ...state, time: { day: EXAM_DAY + 1, slot: 0 } }, ENTER, ctx)).toMatch(
      /The Lantern Trials is held in/,
    );
    const entered = act(state, ENTER);
    expect(entered.exams.run?.teamIds).toEqual(state.people.team?.teammateIds);
    expect(entered.exams.lastSatDay).toBe(EXAM_DAY);
    expect(blockerFor(entered, { type: 'rest' }, ctx)).toBe('You are sitting an exam.');
  });
});

describe('a team of three', () => {
  it('can’t sit with a teammate who isn’t ready', () => {
    const held = teammateNotReady(examDay());
    expect(blockerFor(held.state, ENTER, ctx)).toMatch(/isn’t ready/);
  });

  it('refuses a replacement when the sensei won’t tolerate one', () => {
    const held = teammateNotReady(withSensei(examDay(), 'goran'));
    const friend = friendReady(held.state);
    const swap = {
      type: 'enterExam',
      replacements: [{ leaving: held.id, joining: friend.id }],
    } as const;
    expect(blockerFor(friend.state, swap, ctx)).toBe('Gōran won’t hear of it: a team is a team.');
  });

  it('takes a replacement where the sensei allows, at a hard cost to the one left out', () => {
    const held = teammateNotReady(withSensei(examDay(), 'akari'));
    const friend = friendReady(held.state);
    expect(stageOf(35)).toBeGreaterThanOrEqual(REPLACEMENT_STAGE);
    const swap = {
      type: 'enterExam',
      replacements: [{ leaving: held.id, joining: friend.id }],
    } as const;
    const before = friend.state.people.bonds[held.id]?.points ?? 0;
    const entered = act(friend.state, swap);
    expect(entered.exams.run?.teamIds).toContain(friend.id);
    expect(entered.exams.run?.teamIds).not.toContain(held.id);
    expect(entered.people.bonds[held.id]?.points).toBe(Math.max(0, before - REPLACEMENT_BOND_HIT));
    expect(examNotice(friend.state, ctx)?.entries.map((e) => e.label)).toContain(
      `Sit it with ${ctx.content.people.require(friend.id).name}`,
    );
  });

  it('won’t replace a teammate who is ready', () => {
    const state = withSensei(examDay(), 'akari');
    const friend = friendReady(state);
    const id = state.people.team?.teammateIds[0] ?? '';
    const swap = {
      type: 'enterExam',
      replacements: [{ leaving: id, joining: friend.id }],
    } as const;
    expect(blockerFor(friend.state, swap, ctx)).toMatch(/is ready to sit it with you/);
  });
});
