import { CONTENT_PACKS } from '@/content';
import type { MissionDef, WayLeg } from '@/systems/missions';
import { act, keepClear, newGame, veteran, withAllStats } from '@/test/gameFixtures';

import { awayFor } from './awayNotes';
import { createGameContext } from './context';
import { dispatch } from './dispatch';
import { jobRoadNow, jobWays, withRoads } from './jobRoads';
import { activeStage } from './missionFlow';
import type { GameState } from './state';
import { journeyView, sceneOnScreen } from './views/journeyView';

/** Jobs on the map: a job's road is the quickest open way there or home, kept when it is taken. */

const original = CONTENT_PACKS.find((p) => p.id === 'original')!;
const ctx = createGameContext(original);
const COAST_JOB = 'arc-salt-coast-road';
const country = { ctx, home: 'torogakure' };

/** A capable genin with a record, the harbour's letter answered, every report read. */
function lettered(context = ctx): GameState {
  const ready = { ...withAllStats(veteran(newGame({}, context), 3), 20), reports: [] };
  let state = act(ready, { type: 'startMission', missionId: 'arc-salt-letter' }, context);
  for (let step = 0; state.mission && step < 10; step++) {
    const onward = [
      { type: 'missionContinue' },
      { type: 'missionDecide', optionIndex: 0 },
    ] as const;
    state = act(
      state,
      onward.find((a) => dispatch(state, a, context).ok)!,
      context,
    );
  }
  return state;
}

const leg = (toward: string, region = 'coast-road'): WayLeg => ({
  region,
  days: 1,
  text: `The road to ${toward}.`,
  danger: 'petty',
  toward,
});

describe('jobs on the map', () => {
  it('walks a road as its legs, a camp between stretches, in the job’s own words first', () => {
    const job: MissionDef = {
      ...ctx.content.missions.require(COAST_JOB),
      stages: [
        { kind: 'road', to: 'outbound', text: 'Off you go.', when: { has: 'going' } },
        { kind: 'narrative', text: 'You are there.' },
      ],
    };
    const walked = withRoads(job, [[leg('a'), leg('b', 'hill-road')]], country);
    expect(walked.stages.map((s) => s.kind)).toEqual(['leg', 'camp', 'leg', 'narrative']);
    expect(walked.stages[0]).toMatchObject({ text: 'Off you go.', region: 'coast-road' });
    expect(walked.stages[2]).toMatchObject({ text: 'The road to b.', region: 'hill-road' });
    expect(walked.stages.slice(0, 3).map((s) => s.when)).toEqual(Array(3).fill({ has: 'going' }));
  });

  it('finds the way when the job is taken, keeps it, and counts its days on the notice', () => {
    const state = lettered();
    const def = ctx.content.missions.require(COAST_JOB);
    expect(awayFor(state, ctx, def)).toBe('A day away');
    const ways = jobWays(state, ctx, def);
    expect(ways?.[0]?.map((l) => l.toward)).toEqual(['port-shiomachi']);
    const taken = act(state, { type: 'startMission', missionId: COAST_JOB }, ctx);
    expect(taken.mission?.ways).toEqual(ways);
    expect(activeStage(taken, ctx)).toMatchObject({
      kind: 'leg',
      region: 'coast-road',
      danger: 'petty',
    });
  });

  it('won’t send you out on a road with no way there', () => {
    const roadless = createGameContext({
      ...original,
      routes: original.routes.filter(
        (r) => r.to !== 'port-shiomachi' && r.from !== 'port-shiomachi',
      ),
    });
    const state = lettered(roadless);
    expect(dispatch(state, { type: 'startMission', missionId: COAST_JOB }, roadless)).toEqual({
      ok: false,
      error: 'No road you can walk goes there.',
    });
  });

  it('places the job’s beats along the road by `at`, the rest on arrival', () => {
    const job: MissionDef = {
      ...ctx.content.missions.require(COAST_JOB),
      stages: [
        { kind: 'road', to: 'outbound' },
        { kind: 'narrative', text: 'Halfway.', at: 1 },
        { kind: 'narrative', text: 'Further than the road goes.', at: 5 },
        { kind: 'narrative', text: 'You are there.' },
      ],
    };
    const walked = withRoads(job, [[leg('a'), leg('b')]], country);
    expect(walked.stages.map((s) => (s.kind === 'narrative' ? s.text : s.kind))).toEqual([
      'leg',
      'Halfway.',
      'camp',
      'leg',
      'Further than the road goes.',
      'You are there.',
    ]);
  });

  it('stops at a town’s inn or a landmark on the way, never a day in wild country', () => {
    const job: MissionDef = {
      ...ctx.content.missions.require(COAST_JOB),
      stages: [{ kind: 'road', to: 'outbound' }],
    };
    const pass = withRoads(
      job,
      [[leg('hanebashi'), leg('lanternfall'), leg('mount-reikon')]],
      country,
    );
    expect(pass.stages.map((s) => (s.kind === 'stop' ? s.locationId : s.kind))).toEqual([
      'leg',
      'hanebashi',
      'camp',
      'leg',
      'lanternfall',
      'camp',
      'leg',
    ]);
    const wood = withRoads(job, [[leg('cedar-deep'), leg('kiri-ford')]], country);
    expect(wood.stages.map((s) => s.kind)).toEqual(['leg', 'camp', 'leg']);
  });

  it('draws the job’s road on the map until it reaches the job’s business', () => {
    const taken = act(lettered(), { type: 'startMission', missionId: COAST_JOB }, ctx);
    expect(sceneOnScreen(taken, ctx)).toBe('journey');
    expect(jobRoadNow(taken, ctx)?.plan).toMatchObject({
      from: 'torogakure',
      to: 'port-shiomachi',
    });
    const view = journeyView(taken, ctx);
    expect(view).toMatchObject({ title: 'The road to Port Shiomachi', walked: 0, arrival: null });
    let there = taken;
    for (let step = 0; activeStage(there, ctx)?.kind === 'leg' && step < 5; step++) {
      const onward = there.mission?.roadEvent ? keepClear(there, ctx) : null;
      there = act(there, onward ?? { type: 'missionContinue' }, ctx);
    }
    expect(activeStage(there, ctx)?.kind).toBe('check');
    expect(sceneOnScreen(there, ctx)).toBe('mission');
    expect(journeyView(there, ctx)).toBeNull();
  });
});
