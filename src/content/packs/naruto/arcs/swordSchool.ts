import type { ArcDef, MissionDef } from '@/systems/missions';

import type { EnemyDef } from '../../../types';
import { MASARU_LETTER } from '../people/stories/marks';

/**
 * The Sword School: Masaru's story. A challenger is beating every student at his father's school on the post road; once Masaru trusts you enough to say so, the jobs go up. Go and see, then go back with Masaru to answer the challenge.
 */

const CLIENT = 'Masaru Hagane';
export const SWORD_SCHOOL_FOUND = 'masaru-school-found';
export const SWORD_SCHOOL_SETTLED = 'masaru-school-settled';

export const SWORD_SCHOOL_FOE: EnemyDef = {
  id: 'ronin-kiyomasa',
  kind: 'Rōnin',
  danger: 'deadly',
  name: 'Kiyomasa the Rōnin',
  proper: true,
  pronouns: 'he',
  description: 'A wandering swordsman who breaks schools for a living, and has never lost.',
  baseStat: 10,
  statBonuses: {
    kenjutsu: 12,
    strength: 4,
    stamina: 4,
    speed: 4,
    willpower: 4,
    perception: 3,
    taijutsu: 2,
    reserves: -2,
    chakraControl: -3,
    ninjutsu: -6,
    genjutsu: -6,
    fuuinjutsu: -6,
  },
  maxChakra: 50,
  techniqueIds: ['samurai-sabre', 'swallow-return', 'decapitating-sweep', 'iaido-draw'],
  traits: ['armoured'],
};

export const SWORD_SCHOOL_ACT_ONE: MissionDef = {
  id: 'arc-masaru-school-one',
  title: 'The Challenge',
  rank: 'C',
  client: CLIENT,
  summary: 'Masaru wants to see who has challenged his father’s school.',
  slots: 1,
  energyCost: 25,
  reward: { ryo: 520, reputation: 5 },
  minMissionsCompleted: 4,
  needsWorldMark: MASARU_LETTER,
  stages: [
    {
      kind: 'narrative',
      text: 'Masaru polishes his sword three times before you leave, and still isn’t happy with it.',
    },
    {
      kind: 'leg',
      text: 'Two days on the post road to Shukuba, while Masaru tells you every rule of the school and then which ones he broke.',
      days: 2,
      region: 'hill-road',
    },
    {
      kind: 'check',
      text: 'At the school the students’ practice swords hang broken on the wall in a row.',
      approaches: [
        {
          label: 'Read the breaks in the swords',
          stat: 'perception',
          difficulty: 9,
          onSuccess: {
            effects: [{ kind: 'world', mark: SWORD_SCHOOL_FOUND }],
            ledger: 'Read the challenger’s style in the breaks.',
          },
        },
        {
          label: 'Ask the students what they won’t tell their master',
          stat: 'intellect',
          difficulty: 9,
          onSuccess: {
            effects: [{ kind: 'world', mark: SWORD_SCHOOL_FOUND }],
            ledger: 'Learned how the rōnin beats them.',
          },
        },
      ],
      success:
        'Every sword is broken the same way at the same point, by a rōnin called Kiyomasa who wins with a single cut.',
      failure:
        'The students won’t talk in front of their master, but Masaru knows the breaks, because he has seen that cut before.',
      onFailure: 'forward',
    },
    {
      kind: 'camp',
      text: 'You sleep in the school’s hall, where Masaru and his father sit at opposite ends and neither of them speaks.',
      picks: 2,
      activities: [
        { kind: 'crew', label: 'Sit with Masaru', when: { crew: 'team' } },
        { kind: 'drill', label: 'Drill by the fire' },
        { kind: 'rest', label: 'Sleep properly' },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          text: 'His father doesn’t thank him. He hands Masaru the school’s old practice sword instead, and says, “Come back,” and Masaru takes it.',
        },
      ],
    },
    { kind: 'leg', text: 'Back along the post road to the Leaf.', days: 2 },
  ],
};

export const SWORD_SCHOOL_ACT_TWO: MissionDef = {
  id: 'arc-masaru-school-two',
  title: 'One Cut',
  rank: 'C',
  client: CLIENT,
  summary: 'Back to the school with Masaru, to answer the rōnin’s challenge.',
  slots: 1,
  energyCost: 30,
  reward: { ryo: 600, reputation: 8 },
  minMissionsCompleted: 4,
  needsWorldMark: SWORD_SCHOOL_FOUND,
  stages: [
    {
      kind: 'leg',
      text: 'On the post road again Masaru practises the school’s old forms, the ones he swore he’d never use.',
      days: 2,
      region: 'hill-road',
    },
    {
      kind: 'decision',
      text: 'The rōnin is waiting in the school yard, and Masaru’s father stands in the doorway. Masaru asks you, quietly, “How do I fight him?”',
      options: [
        {
          label: '“With your father’s style.”',
          tone: 'earnest',
          reply: 'Masaru’s father straightens in the doorway.',
          effects: [{ kind: 'mark', mark: 'mercy' }],
          ledger: 'Masaru fought in his father’s style.',
        },
        {
          label: '“With yours. And ours.”',
          tone: 'kind',
          reply: '“Together, then,” Masaru says, looking happier than he has all week.',
          effects: [{ kind: 'mark', mark: 'mercy' }],
          ledger: 'Masaru fought as a shinobi, with the team.',
        },
        {
          label: '“Just win.”',
          tone: 'challenge',
          reply: 'Masaru draws, and in the doorway his father stays silent.',
          ledger: 'Told Masaru to just win.',
        },
      ],
    },
    {
      kind: 'encounter',
      template: 'lone-rogue',
      job: 'eliminate',
      text: 'Kiyomasa draws and makes his one cut, the way he always wins, and this time it meets steel.',
      enemyIds: ['ronin-kiyomasa'],
      canFlee: false,
      bypassable: false,
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'mercy' },
          text: 'The rōnin bows and leaves the school yard. Masaru’s father bows to his son, and then he holds him.',
          effects: [
            { kind: 'world', mark: SWORD_SCHOOL_SETTLED },
            { kind: 'memory', text: 'the day at the sword school' },
          ],
          ledger: 'Answered the challenge, and Masaru’s father bowed.',
        },
        {
          text: 'The rōnin falls in the school yard. Masaru’s father writes the result in the school’s book, and adds his son’s name as its master. Masaru leaves it there.',
          effects: [
            { kind: 'world', mark: SWORD_SCHOOL_SETTLED },
            { kind: 'memory', text: 'the duel in the school yard' },
          ],
          ledger: 'The rōnin fell in the school yard.',
        },
      ],
    },
    {
      kind: 'leg',
      text: 'Back along the post road, with Masaru carrying the old practice sword the whole way.',
      days: 2,
    },
  ],
};

export const SWORD_SCHOOL_JOBS: readonly MissionDef[] = [
  SWORD_SCHOOL_ACT_ONE,
  SWORD_SCHOOL_ACT_TWO,
];

export const SWORD_SCHOOL_ARC: ArcDef = {
  id: 'the-sword-school',
  title: 'The Sword School',
  summary:
    'Someone has challenged Masaru’s father’s school on the post road, and his father wrote at last.',
  acts: [
    {
      beats: ['you', 'need', 'go', 'search'],
      title: 'The challenge',
      text: 'Go and see who has challenged Masaru’s father’s school.',
      jobs: ['arc-masaru-school-one'],
    },
    {
      beats: ['find', 'take', 'return', 'change'],
      title: 'One cut',
      text: 'Go back with Masaru and answer the challenge.',
      jobs: ['arc-masaru-school-two'],
    },
  ],
};
