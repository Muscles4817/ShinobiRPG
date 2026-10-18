import type { ArcDef, MissionDef } from '@/systems/missions';

import type { EnemyDef } from '../../../types';
import { YOMI_UNFINISHED } from '../stories/marks';

/**
 * The Unfinished: Yomi's story. Her teammate's ghost was never at his grave; once Yomi trusts you enough to say so, the jobs go up. Find where he died, then go back with Yomi and lay him down, gently or not.
 */

const CLIENT = 'Yomi Tōkaku';
export const UNFINISHED_FOUND = 'yomi-unfinished-found';
export const UNFINISHED_SETTLED = 'yomi-unfinished-settled';

export const UNFINISHED_FOE: EnemyDef = {
  id: 'soma-ghost',
  kind: 'Spirit',
  danger: 'deadly',
  name: 'Sōma’s Ghost',
  proper: true,
  pronouns: 'he',
  description: 'Yomi’s teammate, still holding the line he died on.',
  baseStat: 11,
  statBonuses: { genjutsu: 4, willpower: 4, stamina: -2 },
  maxChakra: 80,
  techniqueIds: ['whispering-dread', 'moth-dance', 'shadow-feint', 'sap-the-will'],
  traits: ['spirit', 'illusionist'],
};

export const UNFINISHED_ACT_ONE: MissionDef = {
  id: 'arc-yomi-unfinished-one',
  title: 'Where He Fell',
  rank: 'C',
  client: CLIENT,
  summary: 'Yomi wants to find the place her teammate died.',
  slots: 1,
  energyCost: 25,
  reward: { ryo: 520, reputation: 5 },
  minMissionsCompleted: 4,
  needsWorldMark: YOMI_UNFINISHED,
  stages: [
    { kind: 'narrative', text: 'Yomi brings a lantern from the grave nobody visits, unlit.' },
    {
      kind: 'leg',
      text: 'Two days on the hill road. Yomi talks to the empty air beside her, and once it answers.',
      days: 2,
      region: 'hill-road',
    },
    {
      kind: 'check',
      text: 'On the old border hill, the grass grows in a ring around nothing.',
      approaches: [
        {
          label: 'Feel for what doesn’t belong',
          stat: 'perception',
          difficulty: 9,
          role: 'sensor',
          onSuccess: {
            effects: [{ kind: 'world', mark: UNFINISHED_FOUND }],
            ledger: 'Felt the cold at the centre of the ring.',
          },
        },
        {
          label: 'Read the old battle in the ground',
          stat: 'intellect',
          difficulty: 9,
          onSuccess: {
            effects: [{ kind: 'world', mark: UNFINISHED_FOUND }],
            ledger: 'Worked out where the line held.',
          },
        },
      ],
      success: 'At the centre of the ring, the cold never lifts. Yomi kneels there a long time.',
      failure: 'You find nothing, but Yomi walks straight to the cold place as if she was called.',
      onFailure: 'forward',
    },
    {
      kind: 'camp',
      text: 'You camp below the hill. Somebody keeps watch over you all night, and it isn’t any of you.',
      picks: 2,
      activities: [
        { kind: 'crew', label: 'Sit with Yomi', when: { crew: 'team' } },
        { kind: 'drill', label: 'Drill by the fire' },
        { kind: 'rest', label: 'Sleep properly' },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          text: '“He’s still holding the line,” Yomi says. “He doesn’t know it’s over. Next time, I tell him.”',
        },
      ],
    },
    { kind: 'leg', text: 'Back down the hill road to the village.', days: 2 },
  ],
};

export const UNFINISHED_ACT_TWO: MissionDef = {
  id: 'arc-yomi-unfinished-two',
  title: 'Lay Him Down',
  rank: 'C',
  client: CLIENT,
  summary: 'Back to the hill with Yomi, to let her teammate rest.',
  slots: 1,
  energyCost: 30,
  reward: { ryo: 600, reputation: 8 },
  minMissionsCompleted: 4,
  needsWorldMark: UNFINISHED_FOUND,
  stages: [
    {
      kind: 'leg',
      text: 'The hill road again. Yomi lights the lantern at last.',
      days: 2,
      region: 'hill-road',
    },
    {
      kind: 'decision',
      text: 'On the hill, Sōma rises out of the cold, kunai in hand, guarding a road nobody uses. Yomi asks you, “How do I reach him?”',
      options: [
        {
          label: '“Tell him the war is over.”',
          tone: 'earnest',
          reply: 'He hesitates. He has been waiting a long time to hear it.',
          effects: [{ kind: 'mark', mark: 'mercy' }],
          ledger: 'Told Sōma the war was over.',
        },
        {
          label: '“Let him finish the fight.”',
          tone: 'challenge',
          reply: 'Yomi nods slowly. “Then we give him one.”',
          ledger: 'Gave Sōma his last fight.',
        },
        {
          label: '“Show him the lantern.”',
          tone: 'kind',
          reply: 'The light finds his face. He knows it.',
          effects: [{ kind: 'mark', mark: 'mercy' }],
          ledger: 'Showed Sōma the lantern.',
        },
      ],
    },
    {
      kind: 'encounter',
      template: 'spirit',
      job: 'eliminate',
      text: 'Sōma doesn’t know you. He only knows the line, and that you are on the wrong side of it.',
      enemyIds: ['soma-ghost'],
      canFlee: false,
      bypassable: false,
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'mercy' },
          text: 'When it is over Sōma lowers his kunai and looks at Yomi. “You got old,” he says, and smiles, and is gone. The cold lifts from the hill.',
          effects: [
            { kind: 'world', mark: UNFINISHED_SETTLED },
            { kind: 'memory', text: 'the night Sōma rested' },
          ],
          ledger: 'Laid Sōma to rest.',
        },
        {
          text: 'Sōma fights to the end and fades with the dawn. Yomi plants the lantern where he stood. “Finished,” she says.',
          effects: [
            { kind: 'world', mark: UNFINISHED_SETTLED },
            { kind: 'memory', text: 'the dawn on the hill' },
          ],
          ledger: 'Gave Sōma his last fight.',
        },
      ],
    },
    {
      kind: 'leg',
      text: 'Back down the hill road. Yomi doesn’t talk to the air any more on the way home.',
      days: 2,
    },
  ],
};

export const UNFINISHED_JOBS: readonly MissionDef[] = [UNFINISHED_ACT_ONE, UNFINISHED_ACT_TWO];

export const UNFINISHED_ARC: ArcDef = {
  id: 'the-unfinished',
  title: 'The Unfinished',
  summary: 'Yomi has found where her old teammate’s ghost has been all these years.',
  acts: [
    {
      beats: ['you', 'need', 'go', 'search'],
      title: 'Where he fell',
      text: 'Find where Yomi’s teammate died.',
      jobs: ['arc-yomi-unfinished-one'],
    },
    {
      beats: ['find', 'take', 'return', 'change'],
      title: 'Lay him down',
      text: 'Go back with Yomi and let her teammate rest.',
      jobs: ['arc-yomi-unfinished-two'],
    },
  ],
};
