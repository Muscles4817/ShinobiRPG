import type { MissionDef } from '@/systems/missions';

/** The quarter office's work: keeping a town that lives on pleasure pleasant. */
export const OTAFUKU_JOBS: readonly MissionDef[] = [
  {
    id: 'otafuku-hermit-research',
    title: 'A Peeping Problem',
    rank: 'D',
    client: 'The bathhouse on Lantern Row',
    summary:
      'Someone has been watching the women’s bath from the fence, giggling to himself and taking notes, and the bathhouse wants him caught.',
    slots: 2,
    energyCost: 20,
    reward: { ryo: 80, reputation: 2 },
    minMissionsCompleted: 0,
    stages: [
      {
        kind: 'check',
        text: 'A big man with white hair and a notebook is pressed to a hole in the fence. He hears you coming a long way off.',
        approaches: [
          { label: 'Creep up while he is distracted', stat: 'speed', difficulty: 10 },
          {
            label: 'Shout for the bathers and let them deal with it',
            stat: 'willpower',
            difficulty: 8,
          },
        ],
        success:
          'He leaves in a hurry, notebook clutched to his chest, promising it was for a novel.',
        failure:
          'He vanishes in a puff of smoke. The bathers find you at the fence instead, which is worse.',
        onFailure: 'penalty',
        failureDamage: 2,
      },
    ],
  },
  {
    id: 'otafuku-silent-shamisen',
    title: 'The Silent Shamisen',
    rank: 'D',
    client: 'Kotone, at the Willow',
    summary: 'Kotone’s shamisen was taken from the teahouse in the night. She plays tomorrow.',
    slots: 2,
    energyCost: 20,
    reward: { ryo: 90, reputation: 2 },
    minMissionsCompleted: 1,
    stages: [
      {
        kind: 'check',
        text: 'A rival house across the canal is very pleased with itself this morning.',
        approaches: [
          { label: 'Ask questions in the right teahouses', stat: 'intellect', difficulty: 9 },
          { label: 'Slip into their back rooms after dark', stat: 'speed', difficulty: 9 },
        ],
        success:
          'The shamisen comes home without a scratch, and Kotone plays your song that night.',
        failure: 'You find it with a broken string. It will be mended, but not by tomorrow.',
        onFailure: 'penalty',
        failureDamage: 1,
      },
    ],
  },
];
