import { createRng } from '@/core';
import { createStats } from '@/systems/stats';

import { advance, currentStage, reward, startRun, type MissionDef } from './missions';
import { resolveCheck, type CheckStage } from './checks';
import { SOLO } from './crew';
import { isSeniorMission } from './missionRank';

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
    const run = advance(startRun(mission, SOLO), { kind: 'story', text: 'started' });
    expect(currentStage(mission, run)).toBe(check);
    expect(currentStage(mission, advance(run))).toBeUndefined();
  });

  it('advances on a successful check', () => {
    const r = resolveCheck(
      startRun(mission, SOLO),
      { stage: check, approach, story: mission },
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
      startRun(mission, SOLO),
      { stage: check, approach, story: mission },
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

  it('a teammate who takes the check rolls with their own value and is named', () => {
    const r = resolveCheck(
      startRun(mission, SOLO),
      { stage: check, approach, hand: { name: 'Kaen', value: 100 }, story: mission },
      createStats(-100),
      createRng(1),
    );
    expect(r.run.stageIndex).toBe(1);
    expect(r.run.notes[0]).toEqual({ kind: 'choice', text: 'Chase (Kaen)' });
  });

  it('aborts on a failed abort check', () => {
    const abortCheck = { ...check, onFailure: 'abort' as const };
    const r = resolveCheck(
      startRun(mission, SOLO),
      { stage: abortCheck, approach, story: mission },
      createStats(-100),
      createRng(1),
    );
    expect(r.aborted).toBe(true);
    expect(r.run.stageIndex).toBe(0);
  });
});

describe('senior jobs', () => {
  it('counts B-rank and harder towards a jōnin’s record', () => {
    expect(isSeniorMission('B')).toBe(true);
    expect(isSeniorMission('C')).toBe(false);
  });
});
