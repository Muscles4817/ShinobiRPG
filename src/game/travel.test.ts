import { CONTENT_PACKS, type LocationDef } from '@/content';
import { act, newGame } from '@/test/gameFixtures';

import type { GameContext } from './context';
import { createGameContext } from './context';
import { dispatch } from './dispatch';
import { activeStage } from './missionFlow';
import type { GameState } from './state';
import { missionScene } from './views/missionScene';
import { travelView } from './views/travel';

const original = CONTENT_PACKS.find((p) => p.id === 'original')!;
const home = original.locations.find((l) => l.id === original.startLocationId)!;
const market = home.places.filter((p) => p.kind === 'market');

/** The original pack with the given locations opened up, each given a market. */
function opened(...ids: string[]) {
  return createGameContext({
    ...original,
    locations: original.locations.map((l): LocationDef => {
      if (!ids.includes(l.id)) return l;
      const { lockedReason: _opened, ...open } = l;
      return { ...open, places: market };
    }),
  });
}

const openRoads = opened('kiri-ford', 'sakyugakure');

/** A jōnin comes and goes: these tests are about the road, not leave. */
function jonin(context: GameContext = openRoads): GameState {
  const state = newGame({}, context);
  return { ...state, standing: { ...state.standing, rank: 'jonin' } };
}

describe('travel', () => {
  it('refuses destinations that are coming soon', () => {
    const ctx = createGameContext(original);
    expect(dispatch(newGame(), { type: 'travel', locationId: 'sakyugakure' }, ctx)).toEqual({
      ok: false,
      error: 'Coming soon',
    });
  });

  it('won’t take a road through a place that is still coming soon', () => {
    // The dunes opened, but the ford on the way there still to come.
    const ctx = createGameContext({
      ...original,
      locations: opened('sakyugakure').content.locations.all.map((l) =>
        l.id === 'kiri-ford' ? { ...l, lockedReason: 'Coming soon' } : l,
      ),
    });
    expect(dispatch(jonin(ctx), { type: 'travel', locationId: 'sakyugakure' }, ctx)).toEqual({
      ok: false,
      error: 'No open road goes there yet.',
    });
  });

  it('sets out on the road: you are on the way, not there yet', () => {
    const start = jonin();
    const going = act(start, { type: 'travel', locationId: 'sakyugakure' }, openRoads);
    expect(going.locationId).toBe('torogakure');
    expect(going.wallet.ryo).toBe(start.wallet.ryo - 120);
    expect(missionScene(going, openRoads)?.title).toBe('The road to Sakyūgakure');
    expect(dispatch(going, { type: 'travel', locationId: 'port-shiomachi' }, openRoads).ok).toBe(
      false,
    );
  });

  it('walks the legs with a camp between them, and arrives', () => {
    const start = jonin();
    const { state, stages } = walk(
      act(start, { type: 'travel', locationId: 'sakyugakure' }, openRoads),
      openRoads,
    );
    expect(stages).toEqual(['leg', 'camp', 'leg']);
    expect(state.mission).toBeNull();
    expect(state.locationId).toBe('sakyugakure');
    expect(state.time.day).toBe(4);
    expect(dispatch(state, { type: 'sleep' }, openRoads)).toEqual({
      ok: false,
      error: 'Your home is not in this village.',
    });
    expect(dispatch(state, { type: 'eat', foodId: 'rice-ball' }, openRoads).ok).toBe(true);
  });

  it('hurries on without camping, stopping only for what the road brings', () => {
    const start = jonin();
    const hurrying = act(
      start,
      { type: 'travel', locationId: 'sakyugakure', quick: true },
      openRoads,
    );
    // Either there already, or halted by a road event and nothing else.
    if (hurrying.mission) expect(hurrying.mission.roadEvent).toBeDefined();
    const { state, stages } = walk(hurrying, openRoads);
    expect(stages).not.toContain('camp');
    expect(state.locationId).toBe('sakyugakure');
    expect(state.time.day).toBe(4);
  });

  it('comes home the same way, legs reversed', () => {
    const there = walk(
      act(jonin(), { type: 'travel', locationId: 'sakyugakure' }, openRoads),
      openRoads,
    ).state;
    const back = act(there, { type: 'travel', locationId: 'torogakure' }, openRoads);
    expect(back.mission?.journey?.legs.map((l) => l.region)).toEqual(['dune-road', 'forest-track']);
    expect(walk(back, openRoads).state.locationId).toBe('torogakure');
  });

  it('shows the way, the worst of the road and the places passed', () => {
    const dunes = travelView(jonin(), openRoads).destinations.find((d) => d.id === 'sakyugakure');
    expect(dunes).toMatchObject({
      days: 3,
      cost: 120,
      danger: 'Bandits about',
      via: 'By way of Kiri Ford',
      lockedReason: null,
      blocker: null,
    });
  });

  it('shows a locked place with the road it will have', () => {
    const ctx = createGameContext(original);
    const mountain = travelView(newGame(), ctx).destinations.find((d) => d.id === 'mount-reikon');
    expect(mountain).toMatchObject({
      days: 4,
      danger: 'Dangerous road',
      lockedReason: 'Needs Chūnin rank',
    });
  });
});

/** Plays a journey to its end: the first option of any road event, turning in at camp. */
function walk(start: GameState, ctx: GameContext) {
  let state = start;
  const stages: string[] = [];
  for (let step = 0; state.mission && step < 20; step++) {
    if (state.mission.roadEvent) {
      state = act(state, { type: 'missionDecide', optionIndex: 0 }, ctx);
      continue;
    }
    stages.push(activeStage(state, ctx)?.kind ?? 'none');
    state = act(state, { type: 'missionContinue' }, ctx);
  }
  return { state, stages };
}
