import type { ArcDef, MissionDef } from '@/systems/missions';

import type { EnemyDef } from '../../../types';
import { TETSU_BLADE } from '../stories/marks';

/**
 * The Forged Blade: Tetsu's story. The blade he sold, which killed his friend, is in a swordsman's hands on the pass; once Tetsu trusts you enough to say so, the jobs go up. Find who carries it, then go back with Tetsu and take it home to the forge.
 */

const CLIENT = 'Tetsu Kurogane';
export const FORGED_BLADE_FOUND = 'tetsu-blade-found';
export const FORGED_BLADE_SETTLED = 'tetsu-blade-settled';

export const FORGED_BLADE_FOE: EnemyDef = {
  id: 'blade-bearer',
  kind: 'Rogue',
  danger: 'deadly',
  name: 'Shigure, the Blade-Bearer',
  proper: true,
  pronouns: 'he',
  description: 'A swordsman carrying Tetsu’s finest work, and using it well.',
  baseStat: 11,
  statBonuses: { kenjutsu: 4, speed: 2, strength: 1 },
  maxChakra: 60,
  techniqueIds: ['moonfall-slash', 'bleeding-cut', 'cut-the-wick', 'riverbank-draw'],
  traits: ['swift'],
};

export const FORGED_BLADE_ACT_ONE: MissionDef = {
  id: 'arc-tetsu-blade-one',
  title: 'A Blade on the Pass',
  rank: 'C',
  client: CLIENT,
  summary: 'Tetsu wants to know who carries the blade he forged.',
  slots: 1,
  energyCost: 25,
  reward: { ryo: 520, reputation: 5 },
  minMissionsCompleted: 4,
  needsWorldMark: TETSU_BLADE,
  stages: [
    {
      kind: 'narrative',
      text: 'Tetsu closes the forge, which he never does, and sharpens nothing.',
    },
    {
      kind: 'leg',
      text: 'Two days up the pass. Tetsu says even less than usual, which is to say nothing.',
      days: 2,
      region: 'mountain-pass',
    },
    {
      kind: 'check',
      text: 'At a waystation, a traveller describes a sword with a mark you have seen at the forge.',
      approaches: [
        {
          label: 'Read the cuts on the waystation post',
          stat: 'perception',
          difficulty: 9,
          role: 'tracker',
          onSuccess: {
            effects: [{ kind: 'world', mark: FORGED_BLADE_FOUND }],
            ledger: 'Read the blade’s work in the waystation post.',
          },
        },
        {
          label: 'Work out where a swordsman would wait',
          stat: 'intellect',
          difficulty: 9,
          onSuccess: {
            effects: [{ kind: 'world', mark: FORGED_BLADE_FOUND }],
            ledger: 'Worked out where the blade-bearer waits.',
          },
        },
      ],
      success: 'Above the waystation, a camp, and on a stone, the marks of a blade being tested.',
      failure: 'The trail is lost, but Tetsu touches a cut in a post and knows it as his own work.',
      onFailure: 'forward',
    },
    {
      kind: 'camp',
      text: 'You camp in the lee of the pass. Tetsu holds his hammer all night without using it.',
      picks: 2,
      activities: [
        { kind: 'crew', label: 'Sit with Tetsu', when: { crew: 'team' } },
        { kind: 'drill', label: 'Drill by the fire' },
        { kind: 'rest', label: 'Sleep properly' },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          text: '“Mine,” Tetsu says, of the marks on the stone. Then: “Next time.” It is a whole speech, for him.',
        },
      ],
    },
    { kind: 'leg', text: 'Back down the pass to the village.', days: 2 },
  ],
};

export const FORGED_BLADE_ACT_TWO: MissionDef = {
  id: 'arc-tetsu-blade-two',
  title: 'Back to the Forge',
  rank: 'C',
  client: CLIENT,
  summary: 'Back up the pass with Tetsu, to take his blade home.',
  slots: 1,
  energyCost: 30,
  reward: { ryo: 600, reputation: 8 },
  minMissionsCompleted: 4,
  needsWorldMark: FORGED_BLADE_FOUND,
  stages: [
    {
      kind: 'leg',
      text: 'The pass again. Tetsu speaks once: his friend’s name.',
      days: 2,
      region: 'mountain-pass',
    },
    {
      kind: 'decision',
      text: 'The blade-bearer waits on the stone, sword across his knees. Tetsu looks at you. He wants to know what you think.',
      options: [
        {
          label: '“Take the blade. Leave him his life.”',
          tone: 'earnest',
          reply: 'Tetsu nods once.',
          effects: [{ kind: 'mark', mark: 'mercy' }],
          ledger: 'Told Tetsu to take only the blade.',
        },
        {
          label: '“Ask him how he came by it.”',
          tone: 'curious',
          reply: 'The swordsman laughs. “I bought it. Like you sold it.” Tetsu flinches.',
          effects: [{ kind: 'mark', mark: 'mercy' }],
          ledger: 'Asked how the blade was bought.',
        },
        {
          label: '“End it.”',
          tone: 'challenge',
          reply: 'Tetsu says nothing, which is yes.',
          ledger: 'Told Tetsu to end it.',
        },
      ],
    },
    {
      kind: 'encounter',
      template: 'lone-rogue',
      job: 'eliminate',
      text: 'Shigure stands, and Tetsu’s blade comes out of its sheath singing. “Come and take it, smith.”',
      enemyIds: ['blade-bearer'],
      canFlee: false,
      bypassable: false,
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'mercy' },
          text: 'Tetsu takes the blade from the swordsman’s hand and lets him walk away. At home he breaks it in his own forge, and for once he talks all evening.',
          effects: [
            { kind: 'world', mark: FORGED_BLADE_SETTLED },
            { kind: 'memory', text: 'the night the blade came home' },
          ],
          ledger: 'Took the blade home to be broken.',
        },
        {
          text: 'The swordsman falls with Tetsu’s blade still in his hand. Tetsu carries it home and breaks it in the forge without a word.',
          effects: [
            { kind: 'world', mark: FORGED_BLADE_SETTLED },
            { kind: 'memory', text: 'the night at the forge' },
          ],
          ledger: 'The blade-bearer fell on the pass.',
        },
      ],
    },
    {
      kind: 'leg',
      text: 'Back down the pass, the blade wrapped in cloth on Tetsu’s back.',
      days: 2,
    },
  ],
};

export const FORGED_BLADE_JOBS: readonly MissionDef[] = [
  FORGED_BLADE_ACT_ONE,
  FORGED_BLADE_ACT_TWO,
];

export const FORGED_BLADE_ARC: ArcDef = {
  id: 'the-forged-blade',
  title: 'The Forged Blade',
  summary:
    'The blade Tetsu made, the one that killed his friend, has been seen on the mountain pass.',
  acts: [
    {
      beats: ['you', 'need', 'go', 'search'],
      title: 'A blade on the pass',
      text: 'Find who carries the blade Tetsu forged.',
      jobs: ['arc-tetsu-blade-one'],
    },
    {
      beats: ['find', 'take', 'return', 'change'],
      title: 'Back to the forge',
      text: 'Go back with Tetsu and take his blade home.',
      jobs: ['arc-tetsu-blade-two'],
    },
  ],
};
