import { createRng } from '@/core';
import { createStats } from '@/systems/stats';

import {
  advance,
  currentStage,
  resolveCheck,
  reward,
  startRun,
  type MissionDef,
  type CheckStage,
} from './missions';

const check: CheckStage = {
  kind: 'check',
  text: 'Catch the cat',
  approaches: [{ label: 'Chase', stat: 'speed', difficulty: 10 }],
  success: 'Caught!',
  failure: 'It got away.',
  onFailure: 'penalty',
  failureDamage: 3,
};

const mission: MissionDef = {
  id: 'cat',
  title: 'Cat',
  rank: 'D',
  client: 'Old lady',
  summary: '',
  slots: 2,
  energyCost: 10,
  reward: { ryo: 100, reputation: 4 },
  minMissionsCompleted: 0,
  stages: [{ kind: 'narrative', text: 'Off you go.' }, check],
};

const approach = check.approaches[0]!;

describe('missions', () => {
  it('walks through stages', () => {
    const run = advance(startRun(mission), 'started');
    expect(currentStage(mission, run)).toBe(check);
    expect(currentStage(mission, advance(run, 'done'))).toBeUndefined();
  });

  it('advances on a successful check', () => {
    const r = resolveCheck(
      startRun(mission),
      { stage: check, approach },
      createStats(100),
      createRng(1),
    );
    expect(r).toMatchObject({
      aborted: false,
      damage: 0,
      run: { stageIndex: 1, rewardMultiplier: 1 },
    });
  });

  it('penalises the reward on a failed penalty check', () => {
    const r = resolveCheck(
      startRun(mission),
      { stage: check, approach },
      createStats(-100),
      createRng(1),
    );
    expect(r).toMatchObject({
      aborted: false,
      damage: 3,
      run: { stageIndex: 1, rewardMultiplier: 0.75 },
    });
    expect(reward(mission, r.run)).toEqual({ ryo: 75, reputation: 3 });
  });

  it('aborts on a failed abort check', () => {
    const abortCheck = { ...check, onFailure: 'abort' as const };
    const r = resolveCheck(
      startRun(mission),
      { stage: abortCheck, approach },
      createStats(-100),
      createRng(1),
    );
    expect(r.aborted).toBe(true);
    expect(r.run.stageIndex).toBe(0);
  });
});
