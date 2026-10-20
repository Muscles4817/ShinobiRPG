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
  {
    id: 'otafuku-gilded-debt',
    title: 'The Gilded Debt',
    rank: 'C',
    client: 'An Otafuku moneylender',
    summary:
      'A Sand merchant paid a debt with a scroll instead of gold, and swore it was worth more. The moneylender wants it gone before someone comes for it.',
    slots: 3,
    energyCost: 30,
    reward: { ryo: 380, reputation: 10, dustScroll: 'gold-dust' },
    minMissionsCompleted: 15,
    once: true,
    stages: [
      {
        kind: 'check',
        text: 'The scroll is heavier than paper should be, and something gold shifts inside its case.',
        approaches: [
          { label: 'Read the seal before you break it', stat: 'fuuinjutsu', difficulty: 12 },
          { label: 'Weigh what it really is', stat: 'intellect', difficulty: 12 },
        ],
        success:
          'The case opens on an S-rank scroll on gold dust, a Sand secret if ever there was one.',
        failure: 'You open it the slow way, and by then word has gone round the pleasure quarter.',
        onFailure: 'forward',
      },
      {
        kind: 'encounter',
        ground: 'town',
        template: 'bandit-camp',
        job: 'escort',
        text: 'Two hired blades step out of a side street. Someone told them what the moneylender kept.',
        enemyIds: ['bandit-thug', 'bandit-archer'],
        canFlee: false,
      },
    ],
  },
];
