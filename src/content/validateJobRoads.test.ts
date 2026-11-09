import type { MissionDef } from '@/systems/missions';

import { ORIGINAL_PACK } from './packs/original';
import { validateContent } from './validate';

/** Jobs on the map: where they go, that a way exists, where they end, and that they pay for it. */

const COAST_JOB = ORIGINAL_PACK.missions.find((m) => m.id === 'arc-salt-coast-road')!;

function withJob(job: MissionDef): string[] {
  const missions = ORIGINAL_PACK.missions.map((m) => (m.id === job.id ? job : m));
  return validateContent({ ...ORIGINAL_PACK, missions });
}

describe('jobs on the map', () => {
  it('passes the shipped pack', () => {
    expect(validateContent(ORIGINAL_PACK)).toEqual([]);
  });

  it('asks a road out to name where it goes, and only a road out to', () => {
    const { goesTo: _goesTo, ...nowhere } = COAST_JOB;
    expect(withJob(nowhere)).toContain(
      'mission "arc-salt-coast-road" has a road out but nowhere it goes to',
    );
    const stayHome = { ...COAST_JOB, stages: COAST_JOB.stages.filter((s) => s.kind !== 'road') };
    expect(withJob(stayHome)).toContain(
      'mission "arc-salt-coast-road" goes to "port-shiomachi" with no road out',
    );
  });

  it('ends where its last road leaves you, and pays for the days', () => {
    expect(withJob({ ...COAST_JOB, endsAt: 'kiri-ford' })).toContain(
      'mission "arc-salt-coast-road" should end where its last road leaves you, "port-shiomachi"',
    );
    const cheap = { ...COAST_JOB, reward: { ...COAST_JOB.reward, ryo: 10 } };
    expect(withJob(cheap)).toContain(
      'mission "arc-salt-coast-road" pays too little for 1 days away from "torogakure"',
    );
  });

  it('places a beat along a road only straight after one, a whole number of stretches in', () => {
    const [road, ...rest] = COAST_JOB.stages;
    const beat = { kind: 'narrative' as const, text: 'Halfway.', at: 1 };
    expect(withJob({ ...COAST_JOB, stages: [road!, beat, { ...beat, at: 2 }, ...rest] })).toEqual(
      [],
    );
    expect(withJob({ ...COAST_JOB, stages: [beat, road!, ...rest] })).toContain(
      'mission "arc-salt-coast-road" stage 0 is placed along a road but doesn\'t follow one',
    );
    expect(withJob({ ...COAST_JOB, stages: [road!, { ...beat, at: 0.5 }, ...rest] })).toContain(
      'mission "arc-salt-coast-road" stage 1 is placed at 0.5 along its road',
    );
  });
});
