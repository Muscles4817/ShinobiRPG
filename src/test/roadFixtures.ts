import { CONTENT_PACKS, type ContentPack, type LocationDef } from '@/content';
import { createGameContext, type GameContext } from '@/game';
import type { MissionDef } from '@/systems/missions';

/** Jobs that keep you on the road for days, posted every day, in a copy of the original pack. */

const original = CONTENT_PACKS.find((p) => p.id === 'original')!;

/** A chore three days down the coast road: a genin goes alone. */
export const ROAD_JOB: MissionDef = {
  id: 'test-coast-road',
  title: 'The Coast Road',
  rank: 'D',
  client: 'The Harbourmaster',
  summary: 'Carry a sealed ledger to the harbour at Shiomachi and back.',
  slots: 1,
  energyCost: 10,
  reward: { ryo: 600, reputation: 3 },
  minMissionsCompleted: 0,
  standing: true,
  stages: [
    { kind: 'leg', text: 'Three quiet days along the coast road.', days: 3 },
    { kind: 'narrative', text: 'The harbourmaster signs for the ledger.' },
  ],
};

/** A C-rank survey a week out: the team goes, and the sensei leads it. */
export const LONG_TEAM_JOB: MissionDef = {
  ...ROAD_JOB,
  id: 'test-boundary-survey',
  title: 'Walking the Boundary Stones',
  rank: 'C',
  reward: { ryo: 1200, reputation: 6 },
  stages: [
    { kind: 'leg', text: 'Days of stones, moss and wind on the high ground.', days: 7 },
    { kind: 'narrative', text: 'Every stone is where the maps say.' },
  ],
};

function withJobs(location: LocationDef, ids: readonly string[]): LocationDef {
  const places = location.places.map((p) =>
    p.kind === 'missions' ? { ...p, missionIds: [...p.missionIds, ...ids] } : p,
  );
  return { ...location, places };
}

const jobs = [ROAD_JOB, LONG_TEAM_JOB];

export const roadPack: ContentPack = {
  ...original,
  missions: [...original.missions, ...jobs],
  locations: original.locations.map((l) =>
    withJobs(
      l,
      jobs.map((j) => j.id),
    ),
  ),
};

export const roadCtx: GameContext = createGameContext(roadPack);
