import { CONTENT_PACKS, type LocationDef } from '@/content';
import type { Rank } from '@/systems/standing';
import { DAYS_PER_SEASON } from '@/systems/time';
import { signPass } from '@/systems/travel';
import { act, newGame } from '@/test/gameFixtures';

import { createGameContext, type GameContext } from './context';
import { dispatch } from './dispatch';
import {
  CHUNIN_LEAVE_DAYS,
  PASS_DAYS,
  PASS_NEEDED,
  passAfterLesson,
  SAFE_ROADS_ONLY,
} from './leave';
import type { GameState } from './state';
import { travelView } from './views/travel';

const original = CONTENT_PACKS.find((p) => p.id === 'original')!;
const ctx = createGameContext(original);
/** The original pack with the ford opened (a road with bandits on it). */
const fordOpen = createGameContext({
  ...original,
  locations: original.locations.map((l): LocationDef => {
    if (l.id !== 'kiri-ford') return l;
    const { lockedReason: _opened, ...open } = l;
    return { ...open, places: original.locations[0]!.places.filter((p) => p.kind === 'market') };
  }),
});

function ranked(rank: Rank, context: GameContext = ctx): GameState {
  const state = newGame({}, context);
  return { ...state, standing: { ...state.standing, rank } };
}

function withPass(state: GameState): GameState {
  return { ...state, leave: signPass(state.leave, state.time.day, PASS_DAYS) };
}

const toPort = { type: 'travel', locationId: 'port-shiomachi' } as const;
const sensei = (state: GameState) =>
  original.people.find((p) => p.id === state.people.team?.senseiId)!;

describe('leave from the village', () => {
  it('keeps a genin home without their sensei’s pass', () => {
    expect(dispatch(newGame({}, ctx), toPort, ctx)).toEqual({ ok: false, error: PASS_NEEDED });
    expect(travelView(newGame({}, ctx), ctx).leave).toBe(PASS_NEEDED);
  });

  it('lets a genin go on a pass, by safe roads only', () => {
    expect(dispatch(withPass(newGame({}, ctx)), toPort, ctx).ok).toBe(true);
    const toFord = { type: 'travel', locationId: 'kiri-ford' } as const;
    expect(dispatch(withPass(newGame({}, fordOpen)), toFord, fordOpen)).toEqual({
      ok: false,
      error: SAFE_ROADS_ONLY,
    });
  });

  it('a pass runs out', () => {
    const passed = withPass(newGame({}, ctx));
    const later = { ...passed, time: { day: passed.time.day + PASS_DAYS, slot: 0 } };
    expect(dispatch(later, toPort, ctx)).toEqual({ ok: false, error: PASS_NEEDED });
  });

  it('never keeps you from going home', () => {
    const away = { ...newGame({}, ctx), locationId: 'port-shiomachi' };
    expect(dispatch(away, { type: 'travel', locationId: 'torogakure' }, ctx).ok).toBe(true);
  });

  it('your sensei signs a pass at the lesson once they know you, and renews it quietly', () => {
    const state = newGame({}, ctx);
    const teacher = sensei(state);
    const stranger = { ...state, people: { ...state.people, bonds: {} } };
    expect(passAfterLesson(stranger, teacher).leave.passUntil).toBeNull();
    const signed = passAfterLesson(state, teacher);
    expect(signed.leave.passUntil).toBe(state.time.day + PASS_DAYS - 1);
    expect(signed.journal.entries.length).toBe(state.journal.entries.length + 1);
    const renewed = passAfterLesson(
      { ...signed, time: { day: state.time.day + 3, slot: 0 } },
      teacher,
    );
    expect(renewed.journal.entries.length).toBe(signed.journal.entries.length);
    expect(passAfterLesson(ranked('chunin'), teacher).leave.passUntil).toBeNull();
  });

  it('a chūnin spends days of leave, a season’s allowance', () => {
    const chunin = ranked('chunin');
    const gone = act(chunin, { ...toPort, quick: true }, ctx);
    expect(gone.leave.daysTaken).toBe(1);
    expect(travelView(chunin, ctx).leave).toBe(
      `${CHUNIN_LEAVE_DAYS} days of leave left this season.`,
    );
    const spent = {
      ...chunin,
      leave: { ...chunin.leave, season: 0, daysTaken: CHUNIN_LEAVE_DAYS },
    };
    expect(dispatch(spent, toPort, ctx)).toEqual({
      ok: false,
      error: 'You have no days of leave left this season.',
    });
    const nextSeason = { ...spent, time: { day: DAYS_PER_SEASON + 1, slot: 0 } };
    expect(dispatch(nextSeason, toPort, ctx).ok).toBe(true);
  });

  it('a jōnin comes and goes', () => {
    const jonin = ranked('jonin', fordOpen);
    expect(dispatch(jonin, { type: 'travel', locationId: 'kiri-ford' }, fordOpen).ok).toBe(true);
    expect(travelView(jonin, fordOpen).leave).toBeNull();
  });
});
