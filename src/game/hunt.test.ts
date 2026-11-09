import { CONTENT_PACKS } from '@/content';
import { act, keepClear, newGame } from '@/test/gameFixtures';

import { createGameContext, type GameContext } from './context';
import { HUNT_THREAD, huntForTrip, settleHunt } from './hunt';
import { activeStage } from './missionFlow';
import type { GameState } from './state';
import { missionScene } from './views/missionScene';

/** Hunted on the Mist's water: a hidden meter, built up by how you travel and sleep. */

const naruto = CONTENT_PACKS.find((p) => p.id === 'naruto');
const describeFan = naruto ? describe : describe.skip;

/** Which answer to give at a stop: the careless first, the careful last. */
type Answering = 'careless' | 'careful';

interface Crossing {
  readonly state: GameState;
  readonly stages: string[];
}

/** Plays a trip out, answering every stop the same way, until you arrive or are found. */
function cross(start: GameState, ctx: GameContext, answering: Answering): Crossing {
  let state = start;
  const stages: string[] = [];
  for (let step = 0; step < 40 && state.mission; step++) {
    if (state.mission.roadEvent) {
      state = act(state, keepClear(state, ctx), ctx);
      continue;
    }
    const stage = activeStage(state, ctx);
    if (!stage) break;
    stages.push(stage.kind);
    if (stage.kind === 'encounter') break;
    if (stage.kind === 'decision') {
      const careful = answering === 'careful' ? stage.options.length - 1 : 0;
      state = act(state, { type: 'missionDecide', optionIndex: careful }, ctx);
    } else {
      state = act(state, { type: 'missionContinue' }, ctx);
    }
  }
  return { state, stages };
}

describeFan('the hunt', () => {
  const ctx = createGameContext(naruto!);
  const base = newGame({}, ctx);
  /** A jōnin (no leave to worry about) at the Land of Waves, with this clan's blood. */
  const atWaves = (clanId: string, heat = 0): GameState => ({
    ...newGame({ locationId: 'land-of-waves', character: { ...base.character, clanId } }, ctx),
    standing: { ...base.standing, rank: 'jonin' },
    wallet: { ...base.wallet, ryo: 1000 },
    hunt: { heat },
  });
  const legs = ctx.content.routes.require('mist-crossing').legs;

  it('hunts only an awakened bloodline on the Mist’s water', () => {
    expect(huntForTrip(atWaves('hyuga'), ctx, legs)?.townId).toBe('kirigakure');
    expect(huntForTrip(atWaves('uchiha'), ctx, legs)).toBeNull();
    expect(huntForTrip(atWaves('none'), ctx, legs)).toBeNull();
    const coast = ctx.content.routes.require('highway-north').legs;
    expect(huntForTrip(atWaves('hyuga'), ctx, coast)).toBeNull();
  });

  it('asks how you travel and sleep, and keeps the meter out of sight', () => {
    const going = act(atWaves('hyuga'), { type: 'travel', locationId: 'kirigakure' }, ctx);
    expect(going.mission?.journey?.hunt).toBeDefined();
    expect(activeStage(going, ctx)?.kind).toBe('decision');
    expect(missionScene(going, ctx)?.threads).toEqual([]);
    const { state, stages } = cross(going, ctx, 'careless');
    // From a cold trail, even careless answers don't bring them close enough on one crossing.
    expect(stages).toEqual(['decision', 'leg', 'decision']);
    expect(state.locationId).toBe('kirigakure');
    expect(state.hunt.heat).toBe(4);
  });

  it('lets them find you once the trail is warm', () => {
    const going = act(atWaves('hyuga', 6), { type: 'travel', locationId: 'kirigakure' }, ctx);
    const { state, stages } = cross(going, ctx, 'careless');
    expect(stages.at(-1)).toBe('encounter');
    expect(state.mission?.threads[HUNT_THREAD]).toBeGreaterThanOrEqual(
      going.mission?.journey?.hunt?.foundAt ?? Infinity,
    );
  });

  it('keeps careful answers from warming the trail, at a cost in sleep', () => {
    const start = atWaves('hyuga', 3);
    const going = act(start, { type: 'travel', locationId: 'kirigakure' }, ctx);
    const { state, stages } = cross(going, ctx, 'careful');
    expect(stages).not.toContain('encounter');
    expect(state.hunt.heat).toBe(3);
  });

  it('warms the trail each night in the Mist and cools it each day away', () => {
    const inMist = { ...atWaves('hyuga', 2), locationId: 'kirigakure' };
    expect(settleHunt(inMist, ctx).hunt.heat).toBe(3);
    expect(settleHunt({ ...inMist, hunt: { heat: 10 } }, ctx).hunt.heat).toBe(10);
    expect(settleHunt(atWaves('hyuga', 2), ctx).hunt.heat).toBe(1);
    expect(settleHunt(atWaves('hyuga', 0), ctx).hunt.heat).toBe(0);
  });

  it('spares someone in the Mist on their village’s orders', () => {
    const envoy = createGameContext({
      ...naruto!,
      arcs: [
        ...naruto!.arcs,
        {
          id: 'test-embassy',
          title: 'An embassy',
          summary: 'Sent to the Mist.',
          acts: [
            {
              beats: ['go'],
              title: 'The embassy',
              text: 'You are sent.',
              jobs: ['no-such-job'],
              baseLocationId: 'kirigakure',
            },
          ],
        },
      ],
    });
    expect(huntForTrip(atWaves('hyuga'), envoy, legs)).toBeNull();
    const inMist = { ...atWaves('hyuga', 2), locationId: 'kirigakure' };
    expect(settleHunt(inMist, envoy).hunt.heat).toBe(1);
  });
});
