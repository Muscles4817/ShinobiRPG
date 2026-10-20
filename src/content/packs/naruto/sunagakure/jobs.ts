import type { MissionDef } from '@/systems/missions';

import { SUNA_HARD_JOBS } from './hardJobs';

/**
 * The Envoy's Office: what the Sand hands a foreigner. The small jobs are the Outer Ring's; the
 * larger ones are the Sand's old wounds, the Leaf's war and the Breaking Pens, and the taint
 * creeping in from the belt.
 */
const OUTER_RING_JOBS: readonly MissionDef[] = [
  {
    id: 'suna-cistern-watch',
    title: 'The Cistern Watch',
    rank: 'D',
    client: 'Madam Ruri',
    summary:
      'Somebody is drawing water from the Outer Ring’s cistern at night, and in the Sand that is close to murder.',
    slots: 2,
    energyCost: 20,
    reward: { ryo: 100, reputation: 2 },
    minMissionsCompleted: 0,
    stages: [
      {
        kind: 'narrative',
        text: 'The cistern is a cave of still black water under the Cistern House, with a single lamp and a ladle on a chain. Ruri has marked the waterline with a scratch, and every morning it is lower than it should be.',
      },
      {
        kind: 'check',
        text: 'Past midnight, the lamp gutters out, and the chain of the ladle clinks once in the dark.',
        approaches: [
          { label: 'Wait without moving and listen', stat: 'perception', difficulty: 9 },
          { label: 'Rig the ladle chain to a bell', stat: 'intellect', difficulty: 9 },
        ],
        success:
          'The thief is a girl of ten with two skins and a little brother at home with a fever. Ruri lets her off and adds the water to your bill.',
        failure:
          'Whoever it was is gone with a full skin before you find the lamp. Ruri adds the water to your bill anyway.',
        onFailure: 'penalty',
        failureDamage: 1,
      },
    ],
  },
  {
    id: 'suna-bitter-spice',
    title: 'Bitter Spice',
    rank: 'D',
    client: 'The Poison Ward',
    summary:
      'Three people sick from the same stall on Spice Row. The Poison Ward wants to know which jar before there is a fourth.',
    slots: 2,
    energyCost: 15,
    reward: { ryo: 90, reputation: 2 },
    minMissionsCompleted: 0,
    stages: [
      {
        kind: 'check',
        text: 'The stall has forty jars of spice, all of them red, and the stall-keeper is swearing on her children that she sells nothing bad.',
        approaches: [
          { label: 'Taste each on the tip of your tongue', stat: 'willpower', difficulty: 9 },
          {
            label: 'Run chakra through each and feel for the wrong one',
            stat: 'chakraControl',
            difficulty: 9,
          },
        ],
        success:
          'One jar of chilli was cut with grey, glittering sand from the belt. The Poison Ward has an antidote for it by evening.',
        failure:
          'You can’t tell them apart, and the Poison Ward burns the whole stall’s stock to be sure. The stall-keeper doesn’t thank you.',
        onFailure: 'penalty',
        failureDamage: 1,
      },
    ],
  },
];

export const SUNA_JOBS: readonly MissionDef[] = [...OUTER_RING_JOBS, ...SUNA_HARD_JOBS];
