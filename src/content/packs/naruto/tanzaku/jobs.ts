import type { MissionDef } from '@/systems/missions';

/**
 * The Castle Ward Office's work: the constables keep the peace in a town built on luck, and
 * hire a passing shinobi for what needs sharper eyes.
 */
export const TANZAKU_JOBS: readonly MissionDef[] = [
  {
    id: 'tanzaku-loaded-dice',
    title: 'Loaded Dice',
    rank: 'D',
    client: 'The Short Odds',
    summary: 'A traveller has won six nights running. The house would like to know how.',
    slots: 2,
    energyCost: 15,
    reward: { ryo: 90, reputation: 2 },
    minMissionsCompleted: 0,
    stages: [
      {
        kind: 'check',
        text: 'He smiles a lot, tips well, and never lets anyone else touch the cup.',
        approaches: [
          { label: 'Watch his hands, not the dice', stat: 'perception', difficulty: 8 },
          { label: 'Work out the odds of his streak', stat: 'intellect', difficulty: 8 },
        ],
        success:
          'A second cup, up his sleeve, with dice that only roll high. The bouncers take it from there.',
        failure: 'He cashes out and leaves town before you can prove anything.',
        onFailure: 'penalty',
        failureDamage: 1,
      },
    ],
  },
  {
    id: 'tanzaku-unpaid-tab',
    title: 'An Unpaid Tab',
    rank: 'D',
    client: 'The bars of Tanzaku',
    summary:
      'A blonde woman with a pig in tow has left a tab at every bar in town. Find her before she leaves.',
    slots: 3,
    energyCost: 20,
    reward: { ryo: 110, reputation: 3 },
    minMissionsCompleted: 1,
    stages: [
      {
        kind: 'narrative',
        text: 'Every barkeep tells the same story. She drank like a sailor and lost at everything, and laughed about it.',
      },
      {
        kind: 'check',
        text: 'Her young assistant is buying travel rations at dawn, looking guilty.',
        approaches: [
          { label: 'Follow the assistant without being seen', stat: 'speed', difficulty: 9 },
          { label: 'Ask her, kindly, where they are staying', stat: 'willpower', difficulty: 9 },
        ],
        success:
          'The woman pays every tab in full, cracks the table she pays it on, and tells you to mind your own business next time.',
        failure: 'By the time you find the inn, they have gone, and the tab has gone with them.',
        onFailure: 'penalty',
        failureDamage: 2,
      },
    ],
  },
  {
    id: 'tanzaku-castle-crowds',
    title: 'Crowds Under the Castle',
    rank: 'D',
    client: 'The town constables',
    summary: 'The festival brings pickpockets. Walk the crowd and catch one in the act.',
    slots: 2,
    energyCost: 20,
    reward: { ryo: 80, reputation: 2 },
    minMissionsCompleted: 0,
    stages: [
      {
        kind: 'check',
        text: 'Lanterns, music, a thousand people shoulder to shoulder, and a boy who keeps bumping into them.',
        approaches: [
          { label: 'Spot the purse leave the sleeve', stat: 'perception', difficulty: 8 },
          { label: 'Catch him through the crowd', stat: 'speed', difficulty: 8 },
        ],
        success:
          'You hand the constables the boy and eleven purses. Nine of the owners say thank you.',
        failure: 'He slips under a stall and is gone. The constables pay you half, grudgingly.',
        onFailure: 'penalty',
        failureDamage: 1,
      },
    ],
  },
];
