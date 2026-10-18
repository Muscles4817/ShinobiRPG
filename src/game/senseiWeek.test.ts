import { BOND_STAGES, bondWith } from '@/systems/bonds';
import { weekOf } from '@/systems/time';
import { act, ctx, freshGame, newGame } from '@/test/gameFixtures';

import { blockerFor } from './dispatch';
import { meetingOn, meetingsPerWeek, mentorOf, weekPlan } from './sensei/plan';
import {
  flushMentorNotices,
  LESSON_KEPT_REGARD,
  MISSED_REGARD,
  settleMentor,
} from './sensei/settle';
import { SESSION_KEPT_REGARD } from './sensei/sessions';
import { ATTENDANCE_CEILING, startingRegard, withAttendance, withRegard } from './sensei/state';
import type { GameState } from './state';
import { senseiWeekView } from './views/senseiWeek';

/** The week your sensei plans: meetings, short sessions, and the regard they keep. */

const SESSION = { type: 'senseiSession' } as const;

function withSensei(state: GameState, senseiId: string): GameState {
  const team = { ...state.people.team!, senseiId };
  return { ...state, people: { ...state.people, team } };
}

function closeTo(state: GameState, stage: number): GameState {
  const id = state.people.team!.senseiId!;
  const points = BOND_STAGES[stage]!.min;
  return {
    ...state,
    people: { ...state.people, bonds: { ...state.people.bonds, [id]: bondWith(points) } },
  };
}

/** Full and rested, so nothing but the plan stands in the way of a session. */
function fed(state: GameState): GameState {
  const vitals = { ...state.character.vitals, satiety: 100, energy: 100 };
  return { ...state, character: { ...state.character, vitals } };
}

/** Sleeps until the morning of `day`. */
function untilDay(state: GameState, day: number): GameState {
  let s = state;
  while (s.time.day < day) s = act(s, { type: 'sleep' });
  return s;
}

describe('the week your sensei plans', () => {
  it('spreads a punctual sensei’s meetings over the week, the lesson first', () => {
    const state = withSensei(newGame(), 'goran');
    const plan = weekPlan(state, mentorOf(state, ctx)!, 0);
    expect(plan.map((m) => m.day)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(plan[0]?.kind).toBe('lesson');
    expect(plan.slice(1).map((m) => m.kind === 'session' && m.format)).toEqual([
      'march',
      'drill',
      'spar',
      'march',
      'drill',
    ]);
    expect(plan.every((m) => m.from === 'morning')).toBe(true);
  });

  it('an irregular sensei picks their own days, the same each time it is asked', () => {
    const state = withSensei(newGame(), 'yomi');
    const yomi = mentorOf(state, ctx)!;
    const weeks = [0, 1, 2, 3].map((w) => weekPlan(state, yomi, w).map((m) => m.day - w * 7));
    expect(weeks.every((days) => days.length === 2)).toBe(true);
    expect(new Set(weeks.map((d) => d.join())).size).toBeGreaterThan(1);
    expect(weekPlan(state, yomi, 2)).toEqual(weekPlan(state, yomi, 2));
  });

  it('a late sensei comes a slot after they said', () => {
    const state = withSensei(newGame(), 'goran');
    const late = {
      ...mentorOf(state, ctx)!,
      sensei: {
        ...mentorOf(state, ctx)!.sensei!,
        ways: {
          ...mentorOf(state, ctx)!.sensei!.ways!,
          cadence: { sessions: 2, slot: 'morning', punctuality: 'late' },
        },
      },
    } as const;
    expect(weekPlan(state, late, 0).map((m) => m.from)).toEqual(['afternoon', 'afternoon']);
  });

  it('eases off once you are close enough', () => {
    const state = withSensei(newGame(), 'goran');
    const goran = mentorOf(state, ctx)!;
    expect(meetingsPerWeek(state, goran)).toBe(6);
    expect(meetingsPerWeek(closeTo(state, goran.sensei!.ways!.loosensAtStage), goran)).toBe(3);
  });

  it('ends with the genin years', () => {
    const state = newGame();
    const chunin = { ...state, standing: { ...state.standing, rank: 'chunin' as const } };
    expect(mentorOf(chunin, ctx)).toBeNull();
    expect(blockerFor(chunin, SESSION, ctx)).toMatch(/hasn’t set a session/);
  });
});

describe('a short session', () => {
  it('drills the format’s stat, costs energy but no time, and raises regard once', () => {
    const start = untilDay(withSensei(newGame(), 'goran'), 3);
    expect(meetingOn(start, mentorOf(start, ctx)!, 3)).toMatchObject({ format: 'drill' });
    const after = act(start, SESSION);
    expect(after.character.stats.taijutsu).toBeGreaterThan(start.character.stats.taijutsu);
    expect(after.character.vitals.energy).toBeLessThan(start.character.vitals.energy);
    expect(after.time).toEqual(start.time);
    expect(after.mentor.regard).toBe(start.mentor.regard + SESSION_KEPT_REGARD);
    expect(blockerFor(after, SESSION, ctx)).toBe('You’ve had today’s session.');
  });

  it('is only on the day it is planned', () => {
    const state = untilDay(withSensei(newGame(), 'goran'), 7);
    expect(blockerFor(state, SESSION, ctx)).toMatch(/hasn’t set a session/);
  });
});

describe('settling the week', () => {
  it('a missed session costs regard by the sensei’s grip, and they say so', () => {
    const start = untilDay(withSensei(newGame(), 'goran'), 2);
    const next = act(start, { type: 'sleep' });
    expect(next.mentor.regard).toBe(start.mentor.regard - MISSED_REGARD.tight);
    expect(next.mentor.outcomes['2']).toBe('missed');
    const said = next.journal.entries.slice(start.journal.entries.length);
    const missed = said.find((e) => e.tone === 'warning');
    expect(missed?.text).toMatch(/Gōran/);
    expect(missed?.chips).toEqual([{ label: 'Gōran’s regard falls', tone: 'cost' }]);
  });

  it('tells the morning after the night: the sleep, then what was missed, then today', () => {
    const start = untilDay(withSensei(newGame(), 'goran'), 2);
    const next = act(start, { type: 'sleep' });
    const said = next.journal.entries.slice(start.journal.entries.length);
    const missed = said.findIndex((e) => e.tone === 'warning');
    const today = said.findIndex((e) => e.tone === 'info' && e.text.includes('Gōran'));
    const slept = said.findIndex((e) => e.heading !== undefined);
    expect(slept).toBeGreaterThanOrEqual(0);
    expect(slept).toBeLessThan(missed);
    expect(missed).toBeLessThan(today);
    expect(next.mentor.notices).toBeUndefined();
    expect(said.every((e) => !e.text.includes('Training Grounds'))).toBe(true);
  });

  it('never says the same sign-off twice in five sessions', () => {
    let state = withSensei(newGame(), 'goran');
    const signOffs: string[] = [];
    for (let day = 2; day < 30 && signOffs.length < 5; day += 1) {
      state = fed(untilDay(state, day));
      if (blockerFor(state, SESSION, ctx)) continue;
      const before = state.journal.entries.length;
      state = act(state, SESSION);
      const text = state.journal.entries.slice(before).find((e) => e.heading)?.text ?? '';
      signOffs.push(text.slice(text.indexOf('“')));
    }
    expect(signOffs).toHaveLength(5);
    expect(new Set(signOffs).size).toBe(5);
  });

  it('a kept session stays kept, and away from the village you are excused', () => {
    const start = untilDay(withSensei(newGame(), 'goran'), 2);
    expect(act(act(start, SESSION), { type: 'sleep' }).mentor.outcomes['2']).toBe('kept');
    const away = { ...start, locationId: 'port-shiomachi', time: { day: 3, slot: 0 } };
    const next = flushMentorNotices(settleMentor(away, ctx));
    expect(next.mentor.outcomes['2']).toBe('excused');
    expect(next.mentor.regard).toBe(start.mentor.regard);
  });

  it('says in the morning when your sensei expects you, and keeps only this week', () => {
    const state = untilDay(withSensei(newGame(), 'goran'), 9);
    const today = state.journal.entries.filter((e) => e.day === 9).map((e) => e.text);
    expect(today).toContainEqual(
      expect.stringMatching(/Gōran.* at the training ground this morning, .+\.$/),
    );
    const days = Object.keys(state.mentor.outcomes).map((k) => Number(k.replace('t', '')));
    expect(days.every((d) => weekOf(d) === weekOf(9))).toBe(true);
  });
});

describe('a sensei’s first view of you', () => {
  it('leans by where you stood in class, if they care', () => {
    expect(startingRegard('champions-last', 'dead-last')).toBeGreaterThan(
      startingRegard('champions-last', 'genius'),
    );
    expect(startingRegard('pushes-best', 'genius')).toBeGreaterThan(
      startingRegard('pushes-best', 'dead-last'),
    );
    expect(startingRegard('even', 'genius')).toBe(startingRegard('even', 'dead-last'));
  });

  it('is set when you choose them, and their plan starts that day', () => {
    const assigned = act(freshGame(), { type: 'assignTeam' });
    const senseiId = assigned.people.team!.senseiOptions[0]!;
    const formed = act(assigned, { type: 'chooseSensei', senseiId });
    const ways = ctx.content.people.require(senseiId).sensei!.ways!;
    expect(formed.mentor.regard).toBe(
      startingRegard(ways.classRegard, formed.character.classStanding),
    );
    expect(formed.mentor.settledDay).toBe(formed.time.day - 1);
  });
});

describe('the first day with your sensei', () => {
  const LESSON = { type: 'trainWith', personId: 'goran', statId: 'taijutsu' } as const;

  it('stamps the lesson kept on the slip as soon as you have it', () => {
    const taught = act(newGame(), LESSON);
    const view = senseiWeekView(taught, ctx)!;
    expect(view.todayLine).toBe('Done for today.');
    expect(view.days[0]?.outcome).toBe('kept');
  });

  it('is settled like any other: the lesson kept, or missed', () => {
    const start = newGame();
    const kept = act(act(start, LESSON), { type: 'sleep' });
    expect(kept.mentor.outcomes[1]).toBe('kept');
    const missed = act(start, { type: 'sleep' });
    expect(missed.mentor.outcomes[1]).toBe('missed');
    // Gōran keeps a tight grip: a lesson kept is worth its regard, one missed costs more.
    expect(kept.mentor.regard - missed.mentor.regard).toBe(
      LESSON_KEPT_REGARD + MISSED_REGARD.tight,
    );
  });
});

describe('regard for turning up', () => {
  it('rises only so far; past it, only what you do counts', () => {
    const mentor = { ...newGame().mentor, regard: ATTENDANCE_CEILING - 1 };
    expect(withAttendance(mentor, 10).regard).toBe(ATTENDANCE_CEILING);
    expect(withAttendance({ ...mentor, regard: 90 }, 10).regard).toBe(90);
    expect(withRegard({ ...mentor, regard: 90 }, 5).regard).toBe(95);
  });
});
