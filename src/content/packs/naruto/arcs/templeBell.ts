import type { ArcDef, MissionDef } from '@/systems/missions';

import type { EnemyDef } from '../../../types';
import { KANAME_BELL } from '../people/stories/marks';

/**
 * The Temple Bell: Kaname's story. The Fire Temple's great bell has gone silent; once Kaname trusts you enough to say so, the jobs go up. Find out why, then go back with Kaname and face the temple brother who silenced it.
 */

const CLIENT = 'Kaname Ōtori';
export const TEMPLE_BELL_FOUND = 'kaname-bell-found';
export const TEMPLE_BELL_SETTLED = 'kaname-bell-settled';

export const TEMPLE_BELL_FOE: EnemyDef = {
  id: 'joen',
  kind: 'Monk',
  danger: 'deadly',
  name: 'Jōen',
  proper: true,
  pronouns: 'he',
  description: 'Kaname’s temple brother, who learned the same soft style and turned it hard.',
  baseStat: 11,
  statBonuses: { taijutsu: 4, stamina: 2, willpower: 1 },
  maxChakra: 60,
  techniqueIds: ['drunken-fist', 'heel-drop', 'arm-bar', 'shoulder-throw'],
  traits: ['brawler'],
};

export const TEMPLE_BELL_ACT_ONE: MissionDef = {
  id: 'arc-kaname-bell-one',
  title: 'The Silent Bell',
  rank: 'C',
  client: CLIENT,
  summary: 'Kaname wants to find out why the Fire Temple’s bell no longer rings.',
  slots: 1,
  energyCost: 25,
  reward: { ryo: 520, reputation: 5 },
  minMissionsCompleted: 4,
  needsWorldMark: KANAME_BELL,
  stages: [
    {
      kind: 'narrative',
      text: 'Kaname ties on an old prayer bead bracelet before you leave. You have never seen him wear it.',
    },
    {
      kind: 'leg',
      text: 'Two days on the forest track to the temple. Kaname walks faster the closer you get.',
      days: 2,
      region: 'forest-track',
    },
    {
      kind: 'check',
      text: 'In the bell tower, the great bell hangs silent. Its clapper is gone.',
      approaches: [
        {
          label: 'Look for who took the clapper',
          stat: 'perception',
          difficulty: 9,
          role: 'tracker',
          onSuccess: {
            effects: [{ kind: 'world', mark: TEMPLE_BELL_FOUND }],
            ledger: 'Found the clapper’s trail into the hills.',
          },
        },
        {
          label: 'Ask the monks what they won’t say',
          stat: 'intellect',
          difficulty: 9,
          onSuccess: {
            effects: [{ kind: 'world', mark: TEMPLE_BELL_FOUND }],
            ledger: 'Learned which brother left the temple.',
          },
        },
      ],
      success: 'Marks on the tower stairs, and a monk who finally says a name: Jōen.',
      failure:
        'The monks say nothing, but Kaname finds a prayer bead on the stairs and knows whose it is.',
      onFailure: 'forward',
    },
    {
      kind: 'camp',
      text: 'You sleep in the pilgrims’ hall. Kaname sits up with the old abbot until dawn.',
      picks: 2,
      activities: [
        { kind: 'crew', label: 'Sit with Kaname', when: { crew: 'team' } },
        { kind: 'drill', label: 'Drill by the fire' },
        { kind: 'rest', label: 'Sleep properly' },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          text: '“Jōen,” Kaname says. “My temple brother. We learned to fall together.” He bows to the abbot. “I will bring the bell’s voice back.”',
        },
      ],
    },
    { kind: 'leg', text: 'Back along the forest track to the Leaf.', days: 2 },
  ],
};

export const TEMPLE_BELL_ACT_TWO: MissionDef = {
  id: 'arc-kaname-bell-two',
  title: 'Brothers',
  rank: 'C',
  client: CLIENT,
  summary: 'Back to the temple with Kaname, to face the brother who silenced the bell.',
  slots: 1,
  energyCost: 30,
  reward: { ryo: 600, reputation: 8 },
  minMissionsCompleted: 4,
  needsWorldMark: TEMPLE_BELL_FOUND,
  stages: [
    {
      kind: 'leg',
      text: 'The forest track again. Kaname is quiet, the way water is quiet before it falls.',
      days: 2,
      region: 'forest-track',
    },
    {
      kind: 'decision',
      text: 'In the hills above the temple, Jōen waits, the bell’s clapper at his feet. “The temple forgot us,” he says. Kaname asks you, “What do I say to him?”',
      options: [
        {
          label: '“That the temple didn’t forget. You came back.”',
          tone: 'kind',
          reply: 'Jōen’s hands drop an inch.',
          effects: [{ kind: 'mark', mark: 'mercy' }],
          ledger: 'Reminded Jōen the temple had not forgotten him.',
        },
        {
          label: '“Nothing. Just fall together, like before.”',
          tone: 'quiet',
          reply: 'Kaname smiles, sad. “Yes.”',
          effects: [{ kind: 'mark', mark: 'mercy' }],
          ledger: 'Told Kaname to meet Jōen as a brother.',
        },
        {
          label: '“That he’s a thief.”',
          tone: 'challenge',
          reply: 'Jōen’s face hardens. Kaname sighs.',
          ledger: 'Called Jōen a thief.',
        },
      ],
    },
    {
      kind: 'encounter',
      template: 'lone-rogue',
      job: 'eliminate',
      text: 'Jōen comes at Kaname with the same soft style, made hard. It is like watching someone fight their reflection.',
      enemyIds: ['joen'],
      canFlee: false,
      bypassable: false,
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'mercy' },
          text: 'Jōen carries the clapper down to the temple himself. That evening the great bell rings, and Kaname weeps openly, and isn’t ashamed.',
          effects: [
            { kind: 'world', mark: TEMPLE_BELL_SETTLED },
            { kind: 'memory', text: 'the night the bell rang' },
          ],
          ledger: 'Brought Jōen and the bell’s voice home.',
        },
        {
          text: 'Jōen goes down and stays down. Kaname carries the clapper back alone. The bell rings that evening. He doesn’t listen.',
          effects: [
            { kind: 'world', mark: TEMPLE_BELL_SETTLED },
            { kind: 'memory', text: 'the evening of the bell' },
          ],
          ledger: 'Beat Jōen, and brought the clapper home.',
        },
      ],
    },
    {
      kind: 'leg',
      text: 'Back along the forest track to the Leaf. You can hear the bell for a long way.',
      days: 2,
    },
  ],
};

export const TEMPLE_BELL_JOBS: readonly MissionDef[] = [TEMPLE_BELL_ACT_ONE, TEMPLE_BELL_ACT_TWO];

export const TEMPLE_BELL_ARC: ArcDef = {
  id: 'the-temple-bell',
  title: 'The Temple Bell',
  summary: 'The Fire Temple’s great bell has gone silent, and Kaname has not been home in years.',
  acts: [
    {
      beats: ['you', 'need', 'go', 'search'],
      title: 'The silent bell',
      text: 'Find out why the Fire Temple’s bell is silent.',
      jobs: ['arc-kaname-bell-one'],
    },
    {
      beats: ['find', 'take', 'return', 'change'],
      title: 'Brothers',
      text: 'Go back with Kaname and face the brother who silenced the bell.',
      jobs: ['arc-kaname-bell-two'],
    },
  ],
};
