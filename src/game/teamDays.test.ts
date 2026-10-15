import { weekOf } from '@/systems/time';
import { act, ctx, newGame, veteran } from '@/test/gameFixtures';

import { blockerFor } from './dispatch';
import { requirePerson } from './people/cast';
import { pickDone, PICK_REGARD, senseiPick } from './sensei/pick';
import { mentorOf, teamDayOf, teamKey, type TeamDay } from './sensei/plan';
import { settleMentor, MISSED_REGARD } from './sensei/settle';
import { TEAM_DAY_REGARD, TEAMMATE_DAY_BOND } from './sensei/teamDays';
import type { GameState } from './state';
import { missionBoardView } from './views/boards';
import { senseiWeekView } from './views/senseiWeek';

/** Team days (a sensei's rituals) and the job they pick for the team each week. */

const JOIN = { type: 'teamDay' } as const;

function under(senseiId: string, state: GameState = newGame()): GameState {
  const team = { ...state.people.team!, senseiId };
  return { ...state, people: { ...state.people, team } };
}

/** The team day of the current week, and the state on its day at its hour. */
function onTeamDay(senseiId: string): { state: GameState; day: TeamDay } {
  const start = under(senseiId);
  const sensei = mentorOf(start, ctx)!;
  const day = teamDayOf(start, sensei, weekOf(start.time.day) + 1)!;
  const time = { day: day.day, slot: ['morning', 'afternoon', 'evening'].indexOf(day.from) };
  const state = { ...start, time, mentor: { ...start.mentor, settledDay: day.day - 1 } };
  return { state, day };
}

describe('team days', () => {
  it('come once a week, their rituals in turn', () => {
    const state = under('goran');
    const goran = mentorOf(state, ctx)!;
    const kinds = [0, 1, 2, 3].map((w) => teamDayOf(state, goran, w)!.ritual.kind);
    expect(kinds).toEqual(['challenge', 'meal', 'challenge', 'meal']);
    expect(teamDayOf(under('yomi'), mentorOf(under('yomi'), ctx)!, 0)?.ritual.kind).toBe('tea');
  });

  it('bring the team together and earn regard, once', () => {
    const { state, day } = onTeamDay('goran');
    expect(senseiWeekView(state, ctx)?.teamDay?.join.blocker).toBeNull();
    const joined = act(state, JOIN);
    const mate = state.people.team!.teammateIds[0]!;
    expect(joined.people.bonds[mate]!.points).toBeGreaterThanOrEqual(
      state.people.bonds[mate]!.points + TEAMMATE_DAY_BOND,
    );
    expect(joined.mentor.regard).toBeGreaterThanOrEqual(state.mentor.regard + TEAM_DAY_REGARD);
    expect(joined.mentor.outcomes[teamKey(day.day)]).toBe('kept');
    expect(blockerFor(joined, JOIN, ctx)).toBe('You were there today.');
  });

  it('missed, cost regard by the sensei’s grip', () => {
    const { state, day } = onTeamDay('goran');
    const next = settleMentor({ ...state, time: { day: day.day + 1, slot: 0 } }, ctx);
    expect(next.mentor.outcomes[teamKey(day.day)]).toBe('missed');
    expect(next.journal.entries.map((e) => e.text)).toContain(
      'Gōran and the team went ahead without you.',
    );
    expect(next.mentor.regard).toBeLessThanOrEqual(state.mentor.regard - MISSED_REGARD.tight);
  });

  it('are only on their day', () => {
    const state = under('goran');
    const day = teamDayOf(state, requirePerson(state, ctx, 'goran'), weekOf(state.time.day))!;
    const other = { ...state, time: { day: day.day === 1 ? 2 : 1, slot: 2 } };
    expect(blockerFor(other, JOIN, ctx)).toBe('There’s no team day today.');
  });
});

describe('the sensei’s pick', () => {
  it('is a job at home they would lead, marked on its notice, and taking it is remembered', () => {
    const state = under('goran', veteran(newGame(), 10));
    const pick = senseiPick(state, ctx)!;
    expect(pick).not.toBeNull();
    const notices = missionBoardView(state, ctx)?.notices ?? [];
    expect(notices.filter((n) => n.picked !== null).map((n) => n.id)).toEqual([pick.id]);
    expect(notices.find((n) => n.id === pick.id)?.picked).toBe('Gōran’s pick for the team');
    const started = act(state, { type: 'startMission', missionId: pick.id });
    expect(started.mentor.pickTaken).toBe(pick.id);
    const done = pickDone(started, ctx, pick);
    expect(done.mentor.regard).toBe(started.mentor.regard + PICK_REGARD);
    expect(done.mentor.pickKept).toBe(weekOf(started.time.day));
    expect(senseiPick(done, ctx)).toBeNull();
  });

  it('none for a fresh genin with no work their sensei would lead', () => {
    expect(senseiPick(under('goran'), ctx)).toBeNull();
  });
});
