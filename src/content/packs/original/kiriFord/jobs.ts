import type { MissionDef } from '@/systems/missions';

/** The ferry office's work: river jobs for whoever is passing through. */
export const KIRI_FORD_JOBS: readonly MissionDef[] = [
  {
    id: 'ford-loose-ferry',
    title: 'The Loose Ferry',
    rank: 'D',
    client: 'The Ferry Office',
    summary: 'A ferry slipped its rope in the night and is drifting for the rapids.',
    slots: 2,
    energyCost: 20,
    reward: { ryo: 100, reputation: 2 },
    minMissionsCompleted: 0,
    stages: [
      {
        kind: 'check',
        text: 'The empty ferry turns slowly in the current, the rapids already loud downstream.',
        approaches: [
          { label: 'Run the bank and leap aboard', stat: 'speed', difficulty: 8 },
          { label: 'Wade out and haul it in by the rope', stat: 'strength', difficulty: 8 },
        ],
        success: 'You bring it in to the jetty, and the ferrymen cheer like you won a race.',
        failure: 'You catch it at the very lip of the rapids, soaked to the skin and bruised.',
        onFailure: 'penalty',
        failureDamage: 4,
      },
    ],
  },
  {
    id: 'ford-toll-cheat',
    title: 'Who Is Skipping the Toll',
    rank: 'D',
    client: 'The Ferry Office',
    summary: 'Somebody is crossing at night without paying. The office wants to know who.',
    slots: 2,
    energyCost: 15,
    reward: { ryo: 110, reputation: 3 },
    minMissionsCompleted: 1,
    stages: [
      {
        kind: 'check',
        text: 'At midnight a small boat pushes off from the reeds without a lantern, with two shapes in it.',
        approaches: [
          { label: 'Follow it along the bank', stat: 'perception', difficulty: 9 },
          { label: 'Wait where it must land', stat: 'intellect', difficulty: 9 },
        ],
        success:
          'Two of the ferrymen’s own sons, running sweets to the dune caravans. The office is mortified.',
        failure: 'The boat vanishes into the reeds. You bring back a good guess, and no names.',
        onFailure: 'penalty',
        failureDamage: 1,
      },
    ],
  },
];

export const KIRI_FORD_JOB_IDS = KIRI_FORD_JOBS.map((j) => j.id);
