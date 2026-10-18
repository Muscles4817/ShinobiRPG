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
        success: 'You drag the crate up the slipway. Kai counts the jars twice.',
        failure: 'You get it in at last, half drowned, and two jars short.',
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
        text: 'The dark boat ties up at the far jetty. Two men carry something long and heavy up the steps.',
        approaches: [
          { label: 'Follow them through the drying racks', stat: 'speed', difficulty: 9 },
          { label: 'Watch from the roof of the net store', stat: 'perception', difficulty: 9 },
        ],
        success:
          'Rolled bolts of silk, untaxed. Kai is delighted: the fine pays the harbour for a month.',
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
        success: 'The nets come up whole. Something in the hull watches you go, and lets you.',
        failure: 'You come up gasping with half the nets. The crews say thank you anyway.',
        onFailure: 'penalty',
        failureDamage: 4,
      },
    ],
  },
];

export const SHIOMACHI_JOB_IDS = SHIOMACHI_JOBS.map((j) => j.id);
