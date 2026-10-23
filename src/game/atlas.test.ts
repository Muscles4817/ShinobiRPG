import { act, keepClear, newGame } from '@/test/gameFixtures';
import { CEDAR_DEEP, STONE_LANTERN, THE_FALLS, wildCtx as ctx } from '@/test/wildCountry';

import { knowsOf } from './atlas';
import { dispatch } from './dispatch';
import { journeyMission } from './journeys';
import type { GameState } from './state';
import { travelView } from './views/travel';

/** The map as you know it: places heard of and been to, beyond the famous ones. */

function jonin(): GameState {
  const game = newGame({}, ctx);
  return { ...game, standing: { ...game.standing, rank: 'jonin' } };
}

/** On along the road, answering whatever it brings, until there. */
function arrive(start: GameState): GameState {
  let state = start;
  for (let step = 0; state.mission && step < 16; step++) {
    const stage = journeyMission(state.mission.journey!, ctx).stages[state.mission.stageIndex];
    const answer = state.mission.roadEvent
      ? keepClear(state, ctx)
      : stage?.kind === 'stop'
        ? ({ type: 'journeyStop', stay: true } as const)
        : ({ type: 'missionContinue' } as const);
    state = act(state, answer, ctx);
  }
  return state;
}

describe('the map you know', () => {
  it('starts with the places one road from home, and nothing beyond', () => {
    const game = jonin();
    expect(knowsOf(game, ctx, STONE_LANTERN.id)).toBe(true);
    expect(knowsOf(game, ctx, CEDAR_DEEP.id)).toBe(false);
    const view = travelView(game, ctx);
    expect(view.destinations.map((d) => d.id)).not.toContain(THE_FALLS.id);
    expect(view.map.places.map((p) => p.id)).not.toContain(CEDAR_DEEP.id);
    expect(dispatch(game, { type: 'travel', locationId: THE_FALLS.id }, ctx)).toEqual({
      ok: false,
      error: 'You don’t know the way there yet.',
    });
  });

  it('draws a place heard of but never been to faint', () => {
    const lantern = travelView(jonin(), ctx).map.places.find((p) => p.id === STONE_LANTERN.id);
    expect(lantern?.visited).toBe(false);
  });

  it('learns of the places a road leads to from somewhere you arrive', () => {
    const there = arrive(act(jonin(), { type: 'travel', locationId: STONE_LANTERN.id }, ctx));
    expect(there.locationId).toBe(STONE_LANTERN.id);
    expect(there.atlas.visited).toContain(STONE_LANTERN.id);
    expect(knowsOf(there, ctx, CEDAR_DEEP.id)).toBe(true);
  });

  it('hurrying stops at a landmark never seen, and passes it once it has been', () => {
    const game = jonin();
    const told = { ...game, atlas: { ...game.atlas, known: [CEDAR_DEEP.id, THE_FALLS.id] } };
    const hurried = act(told, { type: 'travel', locationId: THE_FALLS.id, quick: true }, ctx);
    expect(hurried.mission?.journey?.stops).toEqual([STONE_LANTERN.id]);
    expect(hurried.mission).not.toBeNull();
    const there = arrive(hurried);
    expect(there.locationId).toBe(THE_FALLS.id);
    expect(there.atlas.visited).toContain(STONE_LANTERN.id);
    const back = act(there, { type: 'travel', locationId: game.locationId, quick: true }, ctx);
    expect(back.mission?.journey?.stops ?? back.journeyEnd?.stops).toEqual([]);
  });
});
