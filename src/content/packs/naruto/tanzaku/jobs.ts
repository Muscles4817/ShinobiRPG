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
  {
    id: 'tanzaku-humming-case',
    title: 'The Humming Scroll Case',
    rank: 'C',
    client: 'A Tanzaku pawnbroker',
    summary:
      'A dead traveller pawned a sealed scroll case that hums at night. The pawnbroker wants it gone, and so do the men watching his shop.',
    slots: 3,
    energyCost: 30,
    reward: { ryo: 420, reputation: 10, hiveRite: 'aburame' },
    minMissionsCompleted: 10,
    once: true,
    stages: [
      {
        kind: 'check',
        text: 'The case is lacquered black and sealed with a clan’s knot. Something inside answers your chakra.',
        approaches: [
          { label: 'Read the seal before you touch it', stat: 'fuuinjutsu', difficulty: 12 },
          { label: 'Steady your chakra and open it slowly', stat: 'chakraControl', difficulty: 12 },
        ],
        success:
          'The seal gives. Inside, a scroll in an old hand and a jar of sleeping beetles, still alive.',
        failure:
          'The seal bites as it opens, and the beetles wake angry. You get the lid back on in time.',
        onFailure: 'forward',
      },
      {
        kind: 'encounter',
        ground: 'town',
        template: 'bandit-camp',
        job: 'escort',
        text: 'A man in a high collar has followed you from the shop, a hired thug beside him. The beetles in the case have gone very still.',
        enemyIds: ['bandit-thug', 'rogue-insect-user'],
        canFlee: false,
      },
    ],
  },
  {
    id: 'tanzaku-glass-grinder',
    title: 'The Glass Grinder’s Scroll',
    rank: 'C',
    client: 'A Tanzaku glassblower',
    summary:
      'The old glassblower’s master left him a scroll he never dared open. It hums when he grinds glass. He wants someone braver to take it.',
    slots: 3,
    energyCost: 30,
    reward: { ryo: 380, reputation: 10, dustScroll: 'glass-sand' },
    minMissionsCompleted: 15,
    once: true,
    stages: [
      {
        kind: 'check',
        text: 'The scroll is wrapped in cloth full of glittering grit. It cuts your fingers through the wrapping.',
        approaches: [
          { label: 'Unwrap it with care', stat: 'perception', difficulty: 12 },
          { label: 'Hold your chakra still while it hums', stat: 'chakraControl', difficulty: 12 },
        ],
        success:
          'Inside, an S-rank scroll on glass sand, in a hand that grinds its letters as much as writes them.',
        failure:
          'You bleed on the wrapping before you have it open, and somebody saw you leave the workshop.',
        onFailure: 'forward',
      },
      {
        kind: 'encounter',
        ground: 'town',
        template: 'bandit-camp',
        job: 'escort',
        text: 'Two thieves have been watching the workshop. They want whatever the old man was afraid of.',
        enemyIds: ['bandit-thug', 'bandit-archer'],
        canFlee: false,
      },
    ],
  },
];
