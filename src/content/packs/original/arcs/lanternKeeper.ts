import type { ArcDef, MissionDef } from '@/systems/missions';

import type { EnemyDef } from '../../../types';
import { AKARI_BROTHER } from '../stories/marks';

/**
 * The Lantern Keeper's Brother: Akari's story. The gifted brother who left the village is selling his fire on the river road; once Akari trusts you enough to say so, the jobs go up. Find where he is, then go back with Akari and bring him home, or not.
 */

const CLIENT = 'Akari Hibana';
export const LANTERN_KEEPER_FOUND = 'akari-brother-found';
export const LANTERN_KEEPER_SETTLED = 'akari-brother-settled';

export const LANTERN_KEEPER_FOE: EnemyDef = {
  id: 'hibana-hiro',
  kind: 'Rogue',
  danger: 'deadly',
  name: 'Hiro Hibana',
  proper: true,
  pronouns: 'he',
  description: 'Akari’s brother, with the same fire as hers, burning the wrong way.',
  baseStat: 10,
  statBonuses: {
    ninjutsu: 7,
    chakraControl: 4,
    reserves: 4,
    speed: 3,
    stamina: 2,
    strength: 1,
    kenjutsu: -2,
    genjutsu: -2,
    fuuinjutsu: -2,
  },
  maxChakra: 95,
  techniqueIds: ['ember-breath', 'ember-rain', 'great-lantern-flame', 'ash-screen'],
  traits: ['swift'],
  nature: 'fire',
};

export const LANTERN_KEEPER_ACT_ONE: MissionDef = {
  id: 'arc-akari-brother-one',
  title: 'Smoke on the River',
  rank: 'C',
  client: CLIENT,
  summary: 'Akari wants to know if the fire-for-hire on the river road is her brother.',
  slots: 1,
  energyCost: 25,
  reward: { ryo: 520, reputation: 5 },
  minMissionsCompleted: 4,
  needsWorldMark: AKARI_BROTHER,
  stages: [
    {
      kind: 'narrative',
      text: 'Akari lights the gate lantern early, and doesn’t look back at it as you leave.',
    },
    {
      kind: 'leg',
      text: 'Two days down the river road. Akari asks at every ferry about a man who lights fires without matches.',
      days: 2,
      region: 'river-road',
    },
    {
      kind: 'check',
      text: 'At a burned-out tollhouse the scorch marks are too neat for an accident.',
      approaches: [
        {
          label: 'Read the burn marks',
          stat: 'perception',
          difficulty: 9,
          role: 'tracker',
          onSuccess: {
            effects: [{ kind: 'world', mark: LANTERN_KEEPER_FOUND }],
            ledger: 'Read the scorch marks back to a camp in the reeds.',
          },
        },
        {
          label: 'Ask who paid for the fire',
          stat: 'intellect',
          difficulty: 9,
          onSuccess: {
            effects: [{ kind: 'world', mark: LANTERN_KEEPER_FOUND }],
            ledger: 'Found out who hired the fire, and where he camps.',
          },
        },
      ],
      success: 'A camp in the reeds, and a lantern hung there, lit, with no oil in it.',
      failure:
        'The trail goes cold, but Akari smells the smoke of his fires on the wind and finds the camp herself.',
      onFailure: 'forward',
    },
    {
      kind: 'camp',
      text: 'Akari doesn’t sleep. She keeps a flame in her palm all night, as if it might call him.',
      picks: 2,
      activities: [
        { kind: 'crew', label: 'Sit with Akari', when: { crew: 'team' } },
        { kind: 'drill', label: 'Drill by the fire' },
        { kind: 'rest', label: 'Sleep properly' },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          text: '“It’s him,” Akari says, looking at the lantern. “He always lit it without oil, to show off.” She turns for home. “Next time I bring him back.”',
        },
      ],
    },
    { kind: 'leg', text: 'Back up the river road to the village.', days: 2 },
  ],
};

export const LANTERN_KEEPER_ACT_TWO: MissionDef = {
  id: 'arc-akari-brother-two',
  title: 'Two Flames',
  rank: 'C',
  client: CLIENT,
  summary: 'Back down the river with Akari, to bring her brother home.',
  slots: 1,
  energyCost: 30,
  reward: { ryo: 600, reputation: 8 },
  minMissionsCompleted: 4,
  needsWorldMark: LANTERN_KEEPER_FOUND,
  stages: [
    {
      kind: 'leg',
      text: 'The river road again. Akari practises what she will say, and throws each version away.',
      days: 2,
      region: 'river-road',
    },
    {
      kind: 'decision',
      text: 'Hiro is waiting at the camp with his hands already burning. Akari turns to you. “Help me reach him. How do I do it?”',
      options: [
        {
          label: '“Tell him the lantern is still lit for him.”',
          tone: 'kind',
          reply: 'Hiro’s face crumples for a moment before he gets it back.',
          effects: [{ kind: 'mark', mark: 'mercy' }],
          ledger: 'Told Hiro the lantern was kept lit for him.',
        },
        {
          label: '“Let him see you won’t fight.”',
          tone: 'quiet',
          reply: 'Akari lowers her hands, and Hiro keeps his up.',
          effects: [{ kind: 'mark', mark: 'mercy' }],
          ledger: 'Akari offered not to fight.',
        },
        {
          label: '“Beat him first. Talk after.”',
          tone: 'challenge',
          reply: 'Akari’s flame flares up in her palm. “Fine. We talk after, then.”',
          ledger: 'Told Akari to beat him first.',
        },
      ],
    },
    {
      kind: 'encounter',
      template: 'lone-rogue',
      job: 'eliminate',
      text: 'Hiro’s fire meets Akari’s over the reeds. “You were always the one they kept,” he says.',
      enemyIds: ['hibana-hiro'],
      canFlee: false,
      bypassable: false,
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'mercy' },
          text: 'Hiro walks back up the river road beside his sister without a word, and at the gate she hands him the taper and he lights the lantern.',
          effects: [
            { kind: 'world', mark: LANTERN_KEEPER_SETTLED },
            { kind: 'memory', text: 'the night Hiro came home' },
          ],
          ledger: 'Brought Hiro Hibana home.',
        },
        {
          text: 'Hiro goes down in the reeds and won’t look at her. Akari leaves him there with the river road and a lit lantern. “He knows the way,” she says.',
          effects: [
            { kind: 'world', mark: LANTERN_KEEPER_SETTLED },
            { kind: 'memory', text: 'the fire in the reeds' },
          ],
          ledger: 'Beat Hiro Hibana, and left him the way home.',
        },
      ],
    },
    { kind: 'leg', text: 'Back up the river road, and Akari doesn’t look back once.', days: 2 },
  ],
};

export const LANTERN_KEEPER_JOBS: readonly MissionDef[] = [
  LANTERN_KEEPER_ACT_ONE,
  LANTERN_KEEPER_ACT_TWO,
];

export const LANTERN_KEEPER_ARC: ArcDef = {
  id: 'the-lantern-keepers-brother',
  title: 'The Lantern Keeper’s Brother',
  summary:
    'Akari’s brother has been seen down the river road, selling his fire to anyone who pays.',
  acts: [
    {
      beats: ['you', 'need', 'go', 'search'],
      title: 'Smoke on the river',
      text: 'Find out if the fire-for-hire is Akari’s brother.',
      jobs: ['arc-akari-brother-one'],
    },
    {
      beats: ['find', 'take', 'return', 'change'],
      title: 'Two flames',
      text: 'Go back with Akari and bring her brother home, one way or another.',
      jobs: ['arc-akari-brother-two'],
    },
  ],
};
