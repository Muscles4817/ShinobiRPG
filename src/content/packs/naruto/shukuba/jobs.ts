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
  {
    id: 'shukuba-black-sand',
    title: 'Black Sand on the Road',
    rank: 'C',
    client: 'A Shukuba innkeeper',
    summary:
      'A guest died owing a month’s board and left a sealed scroll that pulls iron filings off the floor. Men keep asking for his room.',
    slots: 3,
    energyCost: 30,
    reward: { ryo: 380, reputation: 10, dustScroll: 'iron-sand' },
    minMissionsCompleted: 15,
    once: true,
    stages: [
      {
        kind: 'check',
        text: 'The scroll’s seal is old and strong, and black grit clings to the case as if it wanted in.',
        approaches: [
          { label: 'Read the seal before you break it', stat: 'fuuinjutsu', difficulty: 12 },
          { label: 'Steady your chakra against the pull', stat: 'chakraControl', difficulty: 12 },
        ],
        success:
          'The seal gives without biting. Inside, an S-rank scroll on iron sand, written in a hand from the Sand.',
        failure:
          'The case snaps shut on your fingers twice before it opens, and the men downstairs have heard.',
        onFailure: 'forward',
      },
      {
        kind: 'encounter',
        ground: 'town',
        template: 'bandit-camp',
        job: 'escort',
        text: 'A man with a black sack on his back waits in the yard with a hired blade. He came a long way for that scroll.',
        enemyIds: ['bandit-thug', 'iron-sand-rogue'],
        canFlee: false,
      },
    ],
  },
];
