import type { MissionDef } from '@/systems/missions';

/** The post office's errands: small trouble on a busy road. */
export const SHUKUBA_JOBS: readonly MissionDef[] = [
  {
    id: 'shukuba-wrong-door',
    title: 'The Wrong Door',
    rank: 'D',
    client: 'The Highway Inn',
    summary:
      'A white-haired guest went off after a pretty woman and left a boy alone in his room. Strangers keep knocking.',
    slots: 2,
    energyCost: 20,
    reward: { ryo: 70, reputation: 2 },
    minMissionsCompleted: 1,
    stages: [
      {
        kind: 'narrative',
        text: 'The boy is asleep. The corridor outside is very quiet, and very cold.',
      },
      {
        kind: 'check',
        text: 'Two men in long dark cloaks ask the clerk which room the boy is in.',
        approaches: [
          {
            label: 'Keep your nerve and send them the wrong way',
            stat: 'willpower',
            difficulty: 9,
          },
          { label: 'Fetch the white-haired guest, fast', stat: 'speed', difficulty: 9 },
        ],
        success:
          'The guest comes back at a run, no woman in sight, and the cloaked men are gone by morning.',
        failure:
          'One of them looks at you, just once. You wake on the floor of the corridor with a headache.',
        onFailure: 'penalty',
        failureDamage: 4,
      },
    ],
  },
  {
    id: 'shukuba-lost-letters',
    title: 'Lost Letters',
    rank: 'D',
    client: 'The post office',
    summary: 'A courier’s bag split open on the river bend. The letters are all over the reeds.',
    slots: 2,
    energyCost: 20,
    reward: { ryo: 60, reputation: 2 },
    minMissionsCompleted: 0,
    stages: [
      {
        kind: 'check',
        text: 'Wet paper everywhere, half of it already drifting downstream.',
        approaches: [
          { label: 'Wade out and gather them before they sink', stat: 'stamina', difficulty: 8 },
          { label: 'Spot every sheet among the reeds', stat: 'perception', difficulty: 8 },
        ],
        success: 'Every letter, dried by the stove and only a little smudged.',
        failure:
          'You lose a few to the river, and the postmaster writes the apologies with a long face.',
        onFailure: 'penalty',
        failureDamage: 1,
      },
    ],
  },
];
