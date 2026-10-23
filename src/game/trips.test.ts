import { CONTENT_PACKS, type LocationDef } from '@/content';
import { addPoints, NEW_BOND } from '@/systems/bonds';
import { signPass } from '@/systems/travel';
import { act, keepClear, newGame } from '@/test/gameFixtures';

import { createGameContext, type GameContext } from './context';
import { dispatch } from './dispatch';
import { PASS_DAYS } from './leave';
import { activeStage } from './missionFlow';
import { whereNow } from './people/cast';
import type { GameState } from './state';
import { companionBlocker, TRIP_BOND } from './trips';
import { missionScene } from './views/missionScene';
import { travelView } from './views/travel';

const original = CONTENT_PACKS.find((p) => p.id === 'original')!;
const ctx = createGameContext(original);
/** A classmate about in the village in the morning. */
const friend = original.people.find((p) => p.role === 'genin' && p.schedule.morning !== null)!;
const FRIENDS = 30;

function withBond(state: GameState, personId: string, points: number): GameState {
  const bonds = { ...state.people.bonds, [personId]: addPoints(NEW_BOND, points) };
  return { ...state, people: { ...state.people, bonds } };
}

/** A genin on a pass, close to `friend`, on a morning at home. */
function readyToGo(context: GameContext = ctx): GameState {
  const game = newGame({}, context);
  const passed = { ...game, leave: signPass(game.leave, game.time.day, PASS_DAYS) };
  return withBond({ ...passed, time: { ...passed.time, slot: 0 } }, friend.id, FRIENDS);
}

/** Plays the road out: the first way past any road event, turning in at camp. */
function walk(start: GameState, context: GameContext = ctx): GameState {
  let state = start;
  for (let step = 0; state.mission && step < 20; step++) {
    const action = state.mission.roadEvent
      ? keepClear(state, context)
      : ({ type: 'missionContinue' } as const);
    state = act(state, action, context);
  }
  return state;
}

const toPort = { type: 'travel', locationId: 'port-shiomachi' } as const;

describe('a friend along', () => {
  it('comes once you are close and they are about', () => {
    const ready = readyToGo();
    expect(companionBlocker(ready, ctx, friend.id)).toBeNull();
    expect(travelView(ready, ctx).companions.map((c) => c.id)).toContain(friend.id);
    expect(companionBlocker(withBond(ready, friend.id, 0), ctx, friend.id)).toBe(
      `You and ${friend.name} aren’t close enough for that yet.`,
    );
    const sensei = ready.people.team!.senseiId!;
    expect(companionBlocker(withBond(ready, sensei, FRIENDS), ctx, sensei)).toMatch(
      /can’t come with you\.$/,
    );
  });

  it('walks the road with you, is found at your inn, and remembers the way', () => {
    const ready = readyToGo();
    const going = act(ready, { ...toPort, companionId: friend.id }, ctx);
    expect(going.mission?.crew).toEqual({
      kind: 'companion',
      leaderId: null,
      memberIds: [friend.id],
    });
    const there = walk(going);
    expect(there.locationId).toBe('port-shiomachi');
    expect(whereNow(there, ctx, friend)).toBe('gulls-rest');
    expect(there.people.bonds[friend.id]!.points).toBe(
      ready.people.bonds[friend.id]!.points + TRIP_BOND,
    );
    expect(there.village.memories.at(-1)).toMatchObject({
      personId: friend.id,
      text: 'the road to Port Shiomachi',
    });
  });

  it('goes home when you do, and the village tells you what you missed', () => {
    const there = walk(act(readyToGo(), { ...toPort, companionId: friend.id }, ctx));
    expect(there.leave.awaySince).toBe(1);
    const home = walk(act(there, { type: 'travel', locationId: 'torogakure' }, ctx));
    expect(home.locationId).toBe('torogakure');
    expect(home.people.companionId).toBeNull();
    expect(home.leave.awaySince).toBeNull();
    expect(home.reports.at(-1)).toMatchObject({ kind: 'home-again', place: 'Tōrōgakure', days: 2 });
  });
});

/** The original pack with the ford and the dunes opened: a road with a camp on it. */
const openRoads = createGameContext({
  ...original,
  locations: original.locations.map((l): LocationDef => {
    if (l.id !== 'kiri-ford' && l.id !== 'sakyugakure') return l;
    const { lockedReason: _opened, ...open } = l;
    return { ...open, places: original.locations[0]!.places.filter((p) => p.kind === 'market') };
  }),
});

describe('turning back', () => {
  function atCamp(): GameState {
    const game = newGame({}, openRoads);
    const jonin = { ...game, standing: { ...game.standing, rank: 'jonin' as const } };
    let state = act(jonin, { type: 'travel', locationId: 'sakyugakure' }, openRoads);
    for (let step = 0; activeStage(state, openRoads)?.kind !== 'camp' && step < 5; step++) {
      state = act(
        state,
        state.mission?.roadEvent
          ? keepClear(state, openRoads)
          : activeStage(state, openRoads)?.kind === 'stop'
            ? { type: 'journeyStop', stay: false }
            : { type: 'missionContinue' },
        openRoads,
      );
    }
    return state;
  }

  it('is offered at a camp, and walks you back the way you came', () => {
    const camp = atCamp();
    expect(missionScene(camp, openRoads)?.choices.map((c) => c.label)).toContain('Turn back');
    const back = act(camp, { type: 'turnBack' }, openRoads);
    expect(back.mission?.journey).toMatchObject({ to: 'torogakure' });
    expect(back.mission?.journey?.legs.map((l) => l.region)).toEqual(['forest-track']);
    const home = walk(back, openRoads);
    expect(home.locationId).toBe('torogakure');
    expect(home.reports.at(-1)).toMatchObject({ kind: 'home-again', days: 2 });
  });

  it('only at a camp on a trip of your own', () => {
    expect(dispatch(newGame({}, openRoads), { type: 'turnBack' }, openRoads)).toEqual({
      ok: false,
      error: 'You are not on a trip of your own.',
    });
    // On the road, not at a camp: the first stretch is still ahead.
    const onTheRoad = act(readyToGo(), toPort, ctx);
    expect(dispatch(onTheRoad, { type: 'turnBack' }, ctx)).toEqual({
      ok: false,
      error: 'You can turn back only at a camp.',
    });
  });
});
