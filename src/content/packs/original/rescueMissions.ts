import type { MissionDef } from '@/systems/missions';

/** Small jobs that end with an animal following you home (`reward.companionKindId`). */
export const RESCUE_MISSIONS: readonly MissionDef[] = [
  {
    id: 'pup-in-the-culvert',
    title: 'The Pup in the Culvert',
    rank: 'D',
    client: 'Ferryman Gonta',
    summary: 'Something has been crying in the storm culvert under the canal road for two days.',
    slots: 2,
    energyCost: 15,
    reward: { ryo: 80, reputation: 3, companionKindId: 'stray-hound' },
    minMissionsCompleted: 1,
    stages: [
      {
        kind: 'narrative',
        text: 'Gonta leans on his pole. “Pup, I reckon. Nobody’s. Too small to climb out and too frightened to be caught.”',
      },
      {
        kind: 'check',
        text: 'Down in the dark of the culvert, a pair of eyes catches your lantern and backs away.',
        approaches: [
          { label: 'Climb down after it', stat: 'stamina', difficulty: 7 },
          { label: 'Coax it out', stat: 'willpower', difficulty: 8 },
        ],
        success:
          'You come up muddy to the knees with a shivering pup inside your jacket. It will not let go of your sleeve.',
        failure: 'It takes you until dark, and a bite, before the pup lets itself be lifted out.',
        onFailure: 'penalty',
        failureDamage: 3,
      },
    ],
  },
];
