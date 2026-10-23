import { CONTENT_PACKS, type LocationDef } from '@/content';
import { act, newGame } from '@/test/gameFixtures';
import { STONE_LANTERN, wildCtx } from '@/test/wildCountry';

import { createGameContext, type GameContext } from './context';
import { roomPrice, stopAt } from './journeyStops';
import { journeyMission } from './journeys';
import { activeStage } from './missionFlow';
import type { GameState } from './state';
import { missionScene } from './views/missionScene';

/** Places on the way: a room at a town's inn, a landmark's sight, a day in wild country. */

const original = CONTENT_PACKS.find((p) => p.id === 'original')!;
const market = original.locations
  .find((l) => l.id === original.startLocationId)!
  .places.filter((p) => p.kind === 'market');
const openRoads = createGameContext({
  ...original,
  locations: original.locations.map((l): LocationDef => {
    if (l.id !== 'sakyugakure') return l;
    const { lockedReason: _opened, ...open } = l;
    return { ...open, places: market };
  }),
});

function setOut(ctx: GameContext, locationId: string, quick = false): GameState {
  const game = newGame({}, ctx);
  const jonin = { ...game, standing: { ...game.standing, rank: 'jonin' as const } };
  return act(jonin, { type: 'travel', locationId, quick }, ctx);
}

/** On along the road, answering what it brings, until a stop. */
function toStop(start: GameState, ctx: GameContext): GameState {
  let state = start;
  for (let step = 0; activeStage(state, ctx)?.kind !== 'stop' && step < 12; step++) {
    const answer = state.mission?.roadEvent
      ? ({ type: 'missionDecide', optionIndex: 0 } as const)
      : ({ type: 'missionContinue' } as const);
    state = act(state, answer, ctx);
  }
  return state;
}

/** The trip's stages, under way or (hurried there already) just ended. */
function kinds(state: GameState, ctx: GameContext) {
  const plan = state.mission?.journey ?? state.journeyEnd!;
  return journeyMission(plan, ctx).stages.map((s) => s.kind);
}

describe('stopping on the way', () => {
  it('stops where a stretch ends at a town with an inn, and never when hurrying', () => {
    expect(kinds(setOut(openRoads, 'sakyugakure'), openRoads)).toEqual([
      'leg',
      'stop',
      'camp',
      'leg',
    ]);
    expect(kinds(setOut(openRoads, 'sakyugakure', true), openRoads)).not.toContain('stop');
  });

  it('takes a room at the inn in place of the camp, paid at the desk', () => {
    const stop = toStop(setOut(openRoads, 'sakyugakure'), openRoads);
    const price = roomPrice(stop, openRoads, stopAt(openRoads, 'kiri-ford')!);
    expect(missionScene(stop, openRoads)?.choices.map((c) => c.label)).toEqual([
      expect.stringMatching(/^Take a room at /),
      'Camp outside Kiri Ford',
    ]);
    const roomed = act(stop, { type: 'journeyStop', stay: true }, openRoads);
    expect(roomed.wallet.ryo).toBe(stop.wallet.ryo - price);
    expect(activeStage(roomed, openRoads)?.kind).toBe('leg');
    const camped = act(stop, { type: 'journeyStop', stay: false }, openRoads);
    expect(camped.wallet.ryo).toBe(stop.wallet.ryo);
    expect(activeStage(camped, openRoads)?.kind).toBe('camp');
  });

  it('stops at a landmark for its sight, and spends a day in wild country', () => {
    const trip = setOut(wildCtx, 'the-falls');
    expect(kinds(trip, wildCtx).filter((k) => k === 'stop')).toHaveLength(2);
    const atLantern = toStop(trip, wildCtx);
    const saw = act(atLantern, { type: 'journeyStop', stay: true }, wildCtx);
    expect(saw.character.stats.perception).toBeGreaterThan(atLantern.character.stats.perception);
    expect(saw.journal.entries.map((e) => e.heading)).toContain(STONE_LANTERN.name);
    const atDeep = toStop(act(saw, { type: 'missionContinue' }, wildCtx), wildCtx);
    const stayed = act(atDeep, { type: 'journeyStop', stay: true }, wildCtx);
    const passed = act(atDeep, { type: 'journeyStop', stay: false }, wildCtx);
    expect(stayed.time.day).toBe(passed.time.day + 1);
  });
});
