import type { MissionDef } from '@/systems/missions';

/** The steward's favours: the temple pays little, and remembers who helped. */
export const FIRE_TEMPLE_JOBS: readonly MissionDef[] = [
  {
    id: 'temple-pilgrim-road',
    title: 'The Pilgrims’ Stair',
    rank: 'D',
    client: 'The temple steward',
    summary:
      'A party of old pilgrims is struggling up the mountain stair in the rain. Help them up.',
    slots: 2,
    energyCost: 25,
    reward: { ryo: 50, reputation: 3 },
    minMissionsCompleted: 0,
    stages: [
      {
        kind: 'check',
        text: 'The steps are streaming water, and the oldest pilgrim refuses to be carried.',
        approaches: [
          { label: 'Carry their bundles, and him too', stat: 'strength', difficulty: 8 },
          { label: 'Walk beside him, slowly, all the way', stat: 'willpower', difficulty: 8 },
        ],
        success: 'They reach the gate at dusk. The old man prays for you first, before himself.',
        failure:
          'They make it in the end, bruised and soaked through, and you are both covered in mud.',
        onFailure: 'penalty',
        failureDamage: 2,
      },
    ],
  },
  {
    id: 'temple-bell-thief',
    title: 'The Bell Rope',
    rank: 'D',
    client: 'Novice Kei',
    summary:
      'The bell didn’t ring at dawn because somebody cut the rope, and Kei is sure it was a monkey.',
    slots: 2,
    energyCost: 20,
    reward: { ryo: 40, reputation: 2 },
    minMissionsCompleted: 0,
    stages: [
      {
        kind: 'check',
        text: 'Little hand-prints on the bell tower beams, and a length of rope in the cedars.',
        approaches: [
          { label: 'Climb after it into the cedars', stat: 'speed', difficulty: 8 },
          { label: 'Leave fruit out and wait very still', stat: 'perception', difficulty: 8 },
        ],
        success: 'It was a monkey. Kei is unbearable about it for the rest of the day.',
        failure:
          'The monkey keeps the rope, and the monks splice a new one, complaining all the while.',
        onFailure: 'penalty',
        failureDamage: 1,
      },
    ],
  },
];
