import type { ArcDef, MissionDef } from '@/systems/missions';

import type { EnemyDef } from '../../../types';
import { ITO_SEAL } from '../stories/marks';

/**
 * The Patient Thing: Ito's story. What got out through her failed seal years ago has started to move; once Ito trusts you enough to say so, the jobs go up. Find where it has nested, then go back with Ito and seal it, kindly or not.
 */

const CLIENT = 'Ito Shimenawa';
export const PATIENT_THING_FOUND = 'ito-seal-found';
export const PATIENT_THING_SETTLED = 'ito-seal-settled';

export const PATIENT_THING_FOE: EnemyDef = {
  id: 'patient-thing',
  kind: 'Spirit',
  danger: 'deadly',
  name: 'The Patient Thing',
  proper: true,
  pronouns: 'it',
  description: 'It waited years for a seal to weaken, and would happily have waited years more.',
  baseStat: 11,
  statBonuses: { genjutsu: 4, willpower: 4, stamina: -2 },
  maxChakra: 90,
  techniqueIds: ['whispering-dread', 'sap-the-will', 'moth-dance', 'shadow-feint'],
  traits: ['spirit', 'illusionist'],
  healthScale: 1.2,
};

export const PATIENT_THING_ACT_ONE: MissionDef = {
  id: 'arc-ito-seal-one',
  title: 'The Broken Ward',
  rank: 'C',
  client: CLIENT,
  summary: 'Ito wants to find where the thing she let out has nested.',
  slots: 1,
  energyCost: 25,
  reward: { ryo: 520, reputation: 5 },
  minMissionsCompleted: 4,
  needsWorldMark: ITO_SEAL,
  stages: [
    {
      kind: 'narrative',
      text: 'Ito packs three of every seal she owns, and checks each one three times.',
    },
    {
      kind: 'leg',
      text: 'Two days on the forest track, and every shrine you pass has a torn ward on its gate.',
      days: 2,
      region: 'forest-track',
    },
    {
      kind: 'check',
      text: 'Deep in the woods, an old shrine-rope hangs in pieces from the trees.',
      approaches: [
        {
          label: 'Feel for where the cold collects',
          stat: 'perception',
          difficulty: 9,
          role: 'sensor',
          onSuccess: {
            effects: [{ kind: 'world', mark: PATIENT_THING_FOUND }],
            ledger: 'Found where the thing has nested.',
          },
        },
        {
          label: 'Read the torn wards',
          stat: 'intellect',
          difficulty: 9,
          onSuccess: {
            effects: [{ kind: 'world', mark: PATIENT_THING_FOUND }],
            ledger: 'Read the wards back to its nest.',
          },
        },
      ],
      success: 'A hollow under the roots, and in it the patient thing, breathing very slowly.',
      failure: 'You find nothing, but Ito follows the torn wards to the hollow, pale and certain.',
      onFailure: 'forward',
    },
    {
      kind: 'camp',
      text: 'You camp inside a ring of seals around the fire. All night a shape circles outside it, and never once tries to cross.',
      picks: 2,
      activities: [
        { kind: 'crew', label: 'Sit with Ito', when: { crew: 'team' } },
        { kind: 'drill', label: 'Drill by the fire' },
        { kind: 'rest', label: 'Sleep properly' },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          text: '“There,” Ito says, pointing at the roots. “Next time I bring the right seal, and you.”',
        },
      ],
    },
    { kind: 'leg', text: 'Back along the forest track to the village.', days: 2 },
  ],
};

export const PATIENT_THING_ACT_TWO: MissionDef = {
  id: 'arc-ito-seal-two',
  title: 'The Right Seal',
  rank: 'C',
  client: CLIENT,
  summary: 'Back to the woods with Ito, to seal what got out.',
  slots: 1,
  energyCost: 30,
  reward: { ryo: 600, reputation: 8 },
  minMissionsCompleted: 4,
  needsWorldMark: PATIENT_THING_FOUND,
  stages: [
    {
      kind: 'leg',
      text: 'The forest track again. Ito writes the seal as she walks, over and over, until her hand is steady.',
      days: 2,
      region: 'forest-track',
    },
    {
      kind: 'decision',
      text: 'At the roots the thing uncoils and speaks to you in Ito’s own voice. Ito turns to you. “Seal it, or end it?”',
      options: [
        {
          label: '“Seal it. Gently.”',
          tone: 'kind',
          reply: 'Ito’s hands stop shaking, and she takes out the seal she wrote for this.',
          effects: [{ kind: 'mark', mark: 'mercy' }],
          ledger: 'Chose to seal it gently.',
        },
        {
          label: '“Ask it what it wants.”',
          tone: 'curious',
          reply: '“To be let out,” it says. “Only that, ever.” Ito swallows hard.',
          effects: [{ kind: 'mark', mark: 'mercy' }],
          ledger: 'Asked the thing what it wanted.',
        },
        {
          label: '“End it.”',
          tone: 'challenge',
          reply: 'Ito’s jaw sets. “Yes. I think it has to be.”',
          ledger: 'Chose to end it.',
        },
      ],
    },
    {
      kind: 'encounter',
      ground: 'forest',
      template: 'spirit',
      job: 'eliminate',
      text: 'It comes up out of the roots all at once, after all those years of patience.',
      enemyIds: ['patient-thing'],
      canFlee: false,
      bypassable: false,
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'mercy' },
          text: 'Ito’s seal closes round it as softly as a shrine-rope, and it goes still. “Rest now,” she tells it, and back home she checks the seal only twice.',
          effects: [
            { kind: 'world', mark: PATIENT_THING_SETTLED },
            { kind: 'memory', text: 'the night the seal held' },
          ],
          ledger: 'Sealed the patient thing away for good.',
        },
        {
          text: 'It comes apart like smoke in rain. Ito burns the torn wards one by one, and when the last is ash she says “Finally” to nobody in particular.',
          effects: [
            { kind: 'world', mark: PATIENT_THING_SETTLED },
            { kind: 'memory', text: 'the night in the roots' },
          ],
          ledger: 'The patient thing was ended.',
        },
      ],
    },
    {
      kind: 'leg',
      text: 'Back along the forest track, past shrines whose wards are whole again.',
      days: 2,
    },
  ],
};

export const PATIENT_THING_JOBS: readonly MissionDef[] = [
  PATIENT_THING_ACT_ONE,
  PATIENT_THING_ACT_TWO,
];

export const PATIENT_THING_ARC: ArcDef = {
  id: 'the-patient-thing',
  title: 'The Patient Thing',
  summary: 'The thing that got out of Ito’s failed seal has stopped waiting.',
  acts: [
    {
      beats: ['you', 'need', 'go', 'search'],
      title: 'The broken ward',
      text: 'Find where the thing that got out has nested.',
      jobs: ['arc-ito-seal-one'],
    },
    {
      beats: ['find', 'take', 'return', 'change'],
      title: 'The right seal',
      text: 'Go back with Ito and seal what got out.',
      jobs: ['arc-ito-seal-two'],
    },
  ],
};
