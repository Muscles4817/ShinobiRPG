import type { MissionDef } from '@/systems/missions';

/** The ferry office's work: river jobs for whoever is passing through. */
export const KIRI_FORD_JOBS: readonly MissionDef[] = [
  {
    id: 'ford-loose-ferry',
    title: 'The Loose Ferry',
    rank: 'D',
    client: 'The Ferry Office',
    summary: 'A ferry slipped its rope in the night and is drifting for the rapids.',
    slots: 2,
    energyCost: 20,
    reward: { ryo: 100, reputation: 2 },
    minMissionsCompleted: 0,
    stages: [
      {
        kind: 'check',
        text: 'The empty ferry turns slowly in the current, the rapids already loud downstream.',
        approaches: [
          { label: 'Run the bank and leap aboard', stat: 'speed', difficulty: 8 },
          { label: 'Wade out and haul it in by the rope', stat: 'strength', difficulty: 8 },
        ],
        success: 'You bring it in to the jetty, and the ferrymen cheer like you won a race.',
        failure: 'You catch it at the very lip of the rapids, soaked to the skin and bruised.',
        onFailure: 'penalty',
        failureDamage: 4,
      },
    ],
  },
  {
    id: 'ford-toll-cheat',
    title: 'Who Is Skipping the Toll',
    rank: 'D',
    client: 'The Ferry Office',
    summary: 'Somebody is crossing at night without paying. The office wants to know who.',
    slots: 2,
    energyCost: 15,
    reward: { ryo: 110, reputation: 3 },
    minMissionsCompleted: 1,
    stages: [
      {
        kind: 'check',
        text: 'At midnight a small boat pushes off from the reeds without a lantern, with two shapes in it.',
        approaches: [
          { label: 'Follow it along the bank', stat: 'perception', difficulty: 9 },
          { label: 'Wait where it must land', stat: 'intellect', difficulty: 9 },
        ],
        success:
          'Two of the ferrymen’s own sons, running sweets to the dune caravans. The office is mortified.',
        failure: 'The boat vanishes into the reeds. You bring back a good guess, and no names.',
        onFailure: 'penalty',
        failureDamage: 1,
      },
    ],
  },
  {
    id: 'ford-black-sand',
    title: 'Black Sand at the Ford',
    rank: 'C',
    client: 'A Kiri Ford ferryman',
    summary:
      'A drowned traveller’s pack came up in the ford with a scroll that drags the river’s black sand after it. The ferryman wants it off his boat.',
    slots: 3,
    energyCost: 30,
    reward: { ryo: 380, reputation: 10, dustScroll: 'iron-sand' },
    minMissionsCompleted: 15,
    once: true,
    stages: [
      {
        kind: 'check',
        text: 'The scroll is sodden but sealed, and black sand creeps across the deck towards it.',
        approaches: [
          { label: 'Read the seal before you break it', stat: 'fuuinjutsu', difficulty: 12 },
          { label: 'Steady your chakra against the pull', stat: 'chakraControl', difficulty: 12 },
        ],
        success: 'The seal holds the water out. Inside, an S-rank scroll on iron sand.',
        failure:
          'You lose an afternoon drying it out, and the men who drowned its owner hear where it went.',
        onFailure: 'forward',
      },
      {
        kind: 'encounter',
        ground: 'town',
        template: 'bandit-camp',
        job: 'escort',
        text: 'Two river thieves step off the bank. They held the traveller under for that scroll.',
        enemyIds: ['bandit-thug', 'bandit-archer'],
        canFlee: false,
      },
    ],
  },
  {
    id: 'ford-lamp-glass',
    title: 'The Lamp-Glass Scroll',
    rank: 'C',
    client: 'A Kiri Ford lampmaker',
    summary:
      'The lampmaker found a scroll sealed in the base of an old lantern, packed in ground glass. It cuts anyone who handles it.',
    slots: 3,
    energyCost: 30,
    reward: { ryo: 380, reputation: 10, dustScroll: 'glass-sand' },
    minMissionsCompleted: 15,
    once: true,
    stages: [
      {
        kind: 'check',
        text: 'The scroll is packed in glittering grit that slides away from your hands and back.',
        approaches: [
          { label: 'Unwrap it with care', stat: 'perception', difficulty: 12 },
          {
            label: 'Hold your chakra still while it shifts',
            stat: 'chakraControl',
            difficulty: 12,
          },
        ],
        success: 'Inside, an S-rank scroll on glass sand, written by a lantern-maker long dead.',
        failure:
          'You bleed on the grit before you have it out, and the lampmaker’s apprentice runs to tell someone.',
        onFailure: 'forward',
      },
      {
        kind: 'encounter',
        ground: 'town',
        template: 'bandit-camp',
        job: 'escort',
        text: 'Two thieves the apprentice told are waiting outside the workshop.',
        enemyIds: ['bandit-thug', 'bandit-archer'],
        canFlee: false,
      },
    ],
  },
];

export const KIRI_FORD_JOB_IDS = KIRI_FORD_JOBS.map((j) => j.id);
