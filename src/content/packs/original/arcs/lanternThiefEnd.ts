import type { MissionDef } from '@/systems/missions';

import { WATCH } from './lanternThiefStart';

/** The Lantern Thief, acts three and four: the kiln in the reeds, and the wall relit. */

export const REED_KILN: MissionDef = {
  id: 'arc-lantern-reed-kiln',
  title: 'The Kiln in the Reeds',
  rank: 'C',
  client: WATCH,
  summary: 'The smugglers melt the lantern glass at a kiln hidden in the reeds. Shut it down.',
  slots: 1,
  energyCost: 30,
  reward: { ryo: 380, reputation: 8 },
  minMissionsCompleted: 3,
  stages: [
    {
      kind: 'leg',
      text: 'Upriver again, then off the road, wading through reeds taller than you.',
      variants: [
        {
          when: { remembers: 'lantern-boat-seen' },
          text: 'Upriver again, following the channel the night boat took, into reeds taller than you.',
        },
      ],
      days: 1,
    },
    {
      kind: 'narrative',
      text: 'The old kiln squats in a clearing, its chimney breathing smoke. Through the doorway you see who is feeding the furnace with broken lanterns: a skinny boy with lamp-black on his hands.',
      variants: [
        {
          when: { remembers: 'lantern-thief-named' },
          text: 'The old kiln squats in a clearing, its chimney breathing smoke. Through the doorway you see Tobi, the lamplighter’s son, feeding the furnace with broken lanterns.',
        },
      ],
    },
    {
      kind: 'decision',
      text: 'Three smugglers sit outside, drinking. The boy is inside with the fire.',
      options: [
        {
          label: 'Get the boy out first',
          tone: 'kind',
          reply:
            'You slip round the back and pull him out through the ash pit. He doesn’t make a sound. He has clearly hoped for this.',
          effects: [{ kind: 'mark', mark: 'boy-safe' }],
          ledger: 'Got the boy out before the fighting started.',
        },
        {
          label: 'Strike while they’re drinking',
          tone: 'challenge',
          reply: 'You go in fast while their cups are raised.',
        },
      ],
    },
    {
      kind: 'encounter',
      template: 'bandit-camp',
      job: 'eliminate',
      text: 'The smugglers come up off their stools, reaching for boat-hooks.',
      enemyIds: ['bandit-chief', 'river-pirate', 'bandit-archer'],
      canFlee: false,
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'boy-safe' },
          text: 'You break the kiln’s chimney and drown its fire. Tobi watches from the reeds, shaking. “They said they’d burn our house,” he says. “Mother’s house.”',
          effects: [
            { kind: 'world', mark: 'lantern-kiln-burned' },
            { kind: 'world', mark: 'tobi-safe' },
            { kind: 'memory', text: 'the night at the reed kiln' },
          ],
          ledger: 'Shut down the reed kiln, and the boy came out of it unhurt.',
        },
        {
          text: 'In the fight the furnace door burst open and the boy was burned. You carry Tobi out of the reeds while the kiln’s fire dies behind you.',
          effects: [
            { kind: 'world', mark: 'lantern-kiln-burned' },
            { kind: 'world', mark: 'tobi-hurt' },
            { kind: 'memory', text: 'carrying Tobi out of the reeds' },
          ],
          ledger: 'Shut down the reed kiln, but the boy was burned in the fight.',
        },
      ],
    },
    { kind: 'leg', text: 'The long walk home, the boy quiet beside you.', days: 1 },
  ],
};

export const RELIT: MissionDef = {
  id: 'arc-lantern-relit',
  title: 'The Wall Relit',
  rank: 'D',
  client: 'Lamplighter Oume',
  summary:
    'The Watch has new lanterns for the old wall. Oume asks you to help hang them, and to say what happens to her son.',
  slots: 2,
  energyCost: 15,
  reward: { ryo: 120, reputation: 6 },
  minMissionsCompleted: 3,
  stages: [
    {
      kind: 'narrative',
      text: 'You hang new lanterns along the old wall all afternoon, Oume lighting each one behind you. She doesn’t speak until the last.',
      variants: [
        {
          when: { remembers: 'tobi-hurt' },
          text: 'You hang new lanterns along the old wall all afternoon, Oume lighting each one behind you, her son’s bandaged hands in her mind and yours.',
        },
      ],
    },
    {
      kind: 'decision',
      text: '“The captain wants your report,” Oume says. “About Tobi.” She doesn’t ask you to lie. She doesn’t have to.',
      options: [
        {
          label: 'Tell the captain the whole truth',
          tone: 'earnest',
          reply:
            'The captain hears you out and nods slowly. “He’ll scrub the barracks for a season,” he says. “It’s more than fair.”',
          effects: [{ kind: 'world', mark: 'tobi-turned-in' }],
          ledger: 'Told the captain the whole truth about Tobi.',
        },
        {
          label: 'Say he was forced, and vouch for him',
          tone: 'kind',
          reply:
            'The captain looks at you a long time. “On your word,” he says. “If he steals so much as a wick, it’s on you.”',
          effects: [{ kind: 'world', mark: 'tobi-forgiven' }],
          ledger: 'Vouched for Tobi to the Watch.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { remembers: 'tobi-safe' },
          text: 'At dusk the whole wall is lit. Oume stands under the last lantern with her arm round her son, and both of them watch you go.',
          effects: [{ kind: 'world', mark: 'lantern-arc-done' }],
          ledger: 'The old wall is lit again, end to end.',
        },
        {
          text: 'At dusk the whole wall is lit. Oume sets the last lantern on its hook herself, and stays there a long time after you leave.',
          effects: [{ kind: 'world', mark: 'lantern-arc-done' }],
          ledger: 'The old wall is lit again, end to end.',
        },
      ],
    },
  ],
};
