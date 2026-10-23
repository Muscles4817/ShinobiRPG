import { CONTENT_PACKS, type LocationDef, type MapPoint } from '@/content';
import { act, newGame } from '@/test/gameFixtures';

import { createGameContext, type GameContext } from '../context';
import { dispatch } from '../dispatch';
import { activeStage } from '../missionFlow';
import type { GameState } from '../state';
import { journeyView, regionCaption } from './journeyView';
import { activeScene } from './peopleScenes';

const original = CONTENT_PACKS.find((p) => p.id === 'original')!;
const home = original.locations.find((l) => l.id === original.startLocationId)!;
const market = home.places.filter((p) => p.kind === 'market');

/** The original pack with the far places open, each given a market. */
const ctx: GameContext = createGameContext({
  ...original,
  locations: original.locations.map((l): LocationDef => {
    if (!['kiri-ford', 'sakyugakure', 'mount-reikon'].includes(l.id)) return l;
    const { lockedReason: _opened, ...open } = l;
    return { ...open, places: market };
  }),
});

const pointOf = (id: string): MapPoint => {
  const { x, y } = ctx.content.locations.require(id).map;
  return { x, y };
};

/** A jōnin comes and goes: these tests are about the road, not leave. */
function setOut(locationId: string): GameState {
  const game = newGame({}, ctx);
  const jonin = { ...game, standing: { ...game.standing, rank: 'jonin' as const } };
  return act(jonin, { type: 'travel', locationId }, ctx);
}

/** On along the road until the fire, answering whatever it brings. */
function toCamp(start: GameState): GameState {
  let state = start;
  for (let step = 0; activeStage(state, ctx)?.kind !== 'camp' && step < 8; step++) {
    const answer = state.mission?.roadEvent
      ? ({ type: 'missionDecide', optionIndex: 0 } as const)
      : ({ type: 'missionContinue' } as const);
    state = act(state, answer, ctx);
  }
  return state;
}

describe('journeyView', () => {
  it('is only for a trip of your own, which takes the screen as a journey', () => {
    expect(journeyView(newGame({}, ctx), ctx)).toBeNull();
    expect(activeScene(setOut('port-shiomachi'))).toBe('journey');
  });

  it('lays the road out from home to the destination, through the places it passes', () => {
    const view = journeyView(setOut('sakyugakure'), ctx)!;
    expect(view.path[0]).toEqual(pointOf('torogakure'));
    expect(view.path.at(-1)).toEqual(pointOf('sakyugakure'));
    expect(view.legs.map((l) => [l.region, l.toward])).toEqual([
      ['forest-track', 'kiri-ford'],
      ['dune-road', 'sakyugakure'],
    ]);
    expect(view.stops).toEqual([
      expect.objectContaining({ id: 'kiri-ford', kind: 'through', at: view.legs[0]!.end }),
      expect.objectContaining({ id: 'sakyugakure', kind: 'destination', at: 1 }),
    ]);
    expect(view.legs[0]!.start).toBe(0);
    expect(view.legs[1]!.start).toBe(view.legs[0]!.end);
    expect(view).toMatchObject({ walked: 0, seal: 0, waiting: 'road', daysInAll: 3 });
  });

  it('frames the road with room around it, on the map', () => {
    const { frame, path } = journeyView(setOut('sakyugakure'), ctx)!;
    for (const p of path) {
      expect(p.x).toBeGreaterThan(frame.x);
      expect(p.x).toBeLessThan(frame.x + frame.width);
      expect(p.y).toBeGreaterThan(frame.y);
      expect(p.y).toBeLessThan(frame.y + frame.height);
    }
  });

  it('moves the seal on as legs are walked, and stops at the fire', () => {
    const camp = journeyView(toCamp(setOut('sakyugakure')), ctx)!;
    expect(camp).toMatchObject({ walked: 1, daysWalked: 1, waiting: 'camp' });
    expect(camp.seal).toBe(camp.legs[0]!.end);
    expect(camp.progress[camp.walked]).toBe('A day behind you, two ahead');
    expect(journeyView(setOut('sakyugakure'), ctx)!.progress).toEqual([
      'Three days on the road ahead',
      'A day behind you, two ahead',
      'The road behind you',
    ]);
  });

  it('counts a leg walked while its road event waits on you', () => {
    const going = setOut('port-shiomachi');
    const halted = { ...going, mission: { ...going.mission!, roadEvent: 'wayside-shrine' } };
    expect(journeyView(halted, ctx)).toMatchObject({ walked: 1, seal: 1, waiting: 'road-event' });
  });

  it('shares a route among its legs by their days', () => {
    const [hill, pass] = journeyView(setOut('mount-reikon'), ctx)!.legs;
    const spanOf = (l: { start: number; end: number }) => l.end - l.start;
    expect(spanOf(pass!)).toBeCloseTo(spanOf(hill!) * 3);
  });

  it('turned back part-way up a road, starts where you stood', () => {
    const camp = toCamp(setOut('mount-reikon'));
    const up = journeyView(camp, ctx)!;
    const sealAt = up.legs[0]!.end;
    const back = journeyView(act(camp, { type: 'turnBack' }, ctx), ctx)!;
    expect(back.legs.map((l) => l.region)).toEqual(['hill-road']);
    expect(back.path.at(-1)).toEqual(pointOf('torogakure'));
    expect(back.path[0]).not.toEqual(pointOf('mount-reikon'));
    expect(back.path[0]).not.toEqual(pointOf('torogakure'));
    expect(sealAt).toBeGreaterThan(0);
  });
});

describe('arriving', () => {
  /** On along the road, answering whatever it brings, until there. */
  function arrive(start: GameState): GameState {
    let state = start;
    for (let step = 0; state.mission && step < 12; step++) {
      const answer = state.mission.roadEvent
        ? ({ type: 'missionDecide', optionIndex: 0 } as const)
        : ({ type: 'missionContinue' } as const);
      state = act(state, answer, ctx);
    }
    return state;
  }

  it('keeps the road on the map, walked, with the place for its title card', () => {
    const there = arrive(setOut('port-shiomachi'));
    expect(there.locationId).toBe('port-shiomachi');
    expect(activeScene(there)).toBe('journey');
    expect(journeyView(there, ctx)).toMatchObject({
      waiting: 'arrived',
      seal: 1,
      arrival: {
        name: 'Port Shiomachi',
        line: 'After a day on the road',
        enter: 'Walk into Port Shiomachi',
      },
    });
  });

  it('closes when you walk in, or set out again', () => {
    const there = arrive(setOut('port-shiomachi'));
    const onward = act(there, { type: 'travel', locationId: 'torogakure' }, ctx);
    expect(onward.journeyEnd).toBeNull();
    const inside = act(there, { type: 'leaveJourney' }, ctx);
    expect(activeScene(inside)).toBeNull();
    expect(journeyView(inside, ctx)).toBeNull();
    expect(dispatch(inside, { type: 'leaveJourney' }, ctx).ok).toBe(false);
  });
});

describe('regionCaption', () => {
  it('names a region for a caption over the map', () => {
    expect(regionCaption('forest-track')).toBe('The forest track');
    expect(regionCaption('the-void')).toBe('The void');
  });
});
