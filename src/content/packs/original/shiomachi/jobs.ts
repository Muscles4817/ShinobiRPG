import type { MissionDef } from '@/systems/missions';

/**
 * The harbour office's work: civilian jobs an outsider can be trusted with. Short, and paid by
 * the harbour, not the village; a shinobi from up the hill is cheaper than a crew's lost day.
 */
export const SHIOMACHI_JOBS: readonly MissionDef[] = [
  {
    id: 'harbour-lost-cargo',
    title: 'Lost Cargo',
    rank: 'D',
    client: 'Harbourmaster Kai',
    summary: 'A crate of lamp oil went over the side in the night. The tide has it somewhere.',
    slots: 2,
    energyCost: 20,
    reward: { ryo: 90, reputation: 2 },
    minMissionsCompleted: 0,
    stages: [
      {
        kind: 'narrative',
        text: 'Kai points at the grey water as if it owed him money. “Somewhere out there.”',
      },
      {
        kind: 'check',
        text: 'The crate is wedged among the rocks past the breakwater, with the tide coming in.',
        approaches: [
          { label: 'Swim for it before the tide turns', stat: 'stamina', difficulty: 8 },
          {
            label: 'Read the current and wait for it to bring it in',
            stat: 'perception',
            difficulty: 8,
          },
        ],
        success: 'You drag the crate up the slipway, and Kai counts the jars twice.',
        failure: 'You get it in at last, half drowned and two jars short.',
        onFailure: 'penalty',
        failureDamage: 3,
      },
    ],
  },
  {
    id: 'harbour-night-boat',
    title: 'The Boat With No Lantern',
    rank: 'D',
    client: 'Harbourmaster Kai',
    summary: 'A boat comes in after dark with no lantern lit. Find out what it unloads.',
    slots: 2,
    energyCost: 20,
    reward: { ryo: 100, reputation: 3 },
    minMissionsCompleted: 1,
    stages: [
      {
        kind: 'check',
        text: 'The dark boat ties up at the far jetty. Two men carry a long, heavy bundle up the steps between them.',
        approaches: [
          { label: 'Follow them through the drying racks', stat: 'speed', difficulty: 9 },
          { label: 'Watch from the roof of the net store', stat: 'perception', difficulty: 9 },
        ],
        success:
          'Rolled bolts of silk, untaxed. Kai is delighted, because the fine will pay for the harbour for a month.',
        failure: 'They spot you and scatter. Kai gets a description, and not much else.',
        onFailure: 'penalty',
        failureDamage: 2,
      },
    ],
  },
  {
    id: 'harbour-drowned-nets',
    title: 'The Drowned Nets',
    rank: 'D',
    client: 'The fishing crews',
    summary: 'Nets caught on the old wreck off the point. Nobody wants to dive there.',
    slots: 3,
    energyCost: 25,
    reward: { ryo: 120, reputation: 3 },
    minMissionsCompleted: 0,
    stages: [
      {
        kind: 'narrative',
        text: 'The wreck sits in green water off the point, its mast still pointing at the sky.',
      },
      {
        kind: 'check',
        text: 'The nets are wound through the ribs of the hull, and the water is colder than it should be.',
        approaches: [
          { label: 'Hold your breath and cut them free', stat: 'willpower', difficulty: 9 },
          {
            label: 'Work the knots loose with chakra in your fingers',
            stat: 'chakraControl',
            difficulty: 9,
          },
        ],
        success: 'The nets come up whole. Whatever lives in the hull watches you go, and lets you.',
        failure: 'You come up gasping with half the nets. The crews say thank you anyway.',
        onFailure: 'penalty',
        failureDamage: 4,
      },
    ],
  },
  {
    id: 'harbour-lamp-wreck',
    title: 'The Lamp Wreck',
    rank: 'C',
    client: 'Tomoshi Tōga',
    summary:
      'A lamp-ship went down off the breakwater with a Tōga vigil case aboard. Someone has been diving for it at night.',
    slots: 3,
    energyCost: 30,
    reward: { ryo: 420, reputation: 10, hiveRite: 'toga' },
    minMissionsCompleted: 10,
    once: true,
    stages: [
      {
        kind: 'check',
        text: 'The wreck lies in cold green water. The case should be in the stern, if nobody has it yet.',
        approaches: [
          { label: 'Dive with your breath held long', stat: 'stamina', difficulty: 12 },
          { label: 'Feel for the moths sleeping in it', stat: 'perception', difficulty: 12 },
        ],
        success:
          'The case is wedged under a beam, its seal unbroken. Something inside flutters against the lid.',
        failure:
          'You come up empty twice before you find it, and the divers on the shore have seen you.',
        onFailure: 'forward',
      },
      {
        kind: 'encounter',
        ground: 'town',
        template: 'bandit-camp',
        job: 'escort',
        text: 'Two salvagers are waiting on the breakwater. They dived for the case all week and want it.',
        enemyIds: ['bandit-thug', 'bandit-archer'],
        canFlee: false,
      },
    ],
  },
];

export const SHIOMACHI_JOB_IDS = SHIOMACHI_JOBS.map((j) => j.id);
