import type { MissionDef } from '@/systems/missions';

import { MERCY } from './fordChainStart';
import { BREWER, BREWER_CLUES } from './brewerGhostStart';

/**
 * The Brewer's Ghost, the last act and what comes after: the night you face her, where the
 * clues you found decide whether you can call her by name, and two later jobs that come only
 * from what you chose (the quiet way comes back; the true way is thanked).
 */

export const GHOST_NIGHT: MissionDef = {
  id: 'arc-brewer-ghost-night',
  title: 'The Night of the Ghost',
  rank: 'D',
  client: BREWER,
  summary: 'The end of the month. Gensai wants his brewery quiet, tonight, for good.',
  slots: 2,
  energyCost: 25,
  reward: { ryo: 160, reputation: 5 },
  minMissionsCompleted: 3,
  stages: [
    {
      kind: 'narrative',
      text: 'At midnight the yard goes cold. The boards on the well lift by themselves, and she climbs out: a woman in a drowned wedding robe, looking only at Gensai.',
      variants: [
        {
          when: { remembers: 'brewer-wrong-man' },
          text: 'At midnight the boards on the well burst apart. She comes out of the water screaming, a woman in a drowned wedding robe, and the vats crack one by one.',
        },
      ],
    },
    {
      kind: 'decision',
      text: 'Gensai is behind you, gripping your sleeve. “Do it,” he whispers. “What I paid you for.”',
      options: [
        {
          when: { tally: BREWER_CLUES, atLeast: 2 },
          label: 'Call her Oharu, and tell her what is known now',
          tone: 'kind',
          reply:
            'She stops at her name. You tell her about the sandals by the well, the empty coffin, the hairpin on the ledge. She turns to Gensai, and he falls to his knees and says it all, to her and to the whole yard.',
          effects: [
            { kind: 'mark', mark: 'named-her' },
            { kind: 'tally', tally: MERCY, by: 1 },
          ],
          ledger: 'Called the ghost by her name, and the brewer confessed in front of her.',
        },
        {
          when: { tally: BREWER_CLUES, atLeast: 1 },
          label: 'Tell Gensai to confess, here, in front of her',
          tone: 'challenge',
          reply:
            '“Confess what?” he says, and backs away. She follows him. You have to stand in her way.',
          ledger: 'Told the brewer to confess. He wouldn’t.',
        },
        {
          label: 'Lay her by force, as you were paid to',
          tone: 'quiet',
          reply: 'You step between them and make the seal.',
          ledger: 'Set out to lay the ghost by force.',
        },
      ],
    },
    {
      // The wrong man hauled away made her angrier: the cold itself fights beside her.
      when: { all: [{ lacks: 'named-her' }, { remembers: 'brewer-wrong-man' }] },
      kind: 'encounter',
      template: 'spirit',
      job: 'eliminate',
      text: 'She comes at you in a storm of cold, and the cellar’s chill rises with her.',
      enemyIds: ['hungry-ghost', 'storehouse-wraith'],
      canFlee: false,
      talkable: false,
    },
    {
      // Unless the angry fight above already happened.
      when: {
        all: [{ lacks: 'named-her' }, { lacks: 'fought-past' }, { lacks: 'slipped-past' }],
      },
      kind: 'encounter',
      template: 'spirit',
      job: 'eliminate',
      text: 'She comes at you through the cold, water streaming from her sleeves.',
      enemyIds: ['hungry-ghost'],
      canFlee: false,
      talkable: false,
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'named-her' },
          text: 'Oharu goes back into the well like someone going home. At dawn the Watch lifts her bones and takes Gensai away. Nobody pays you, and the village talks of nothing else for a week.',
          effects: [
            { kind: 'world', mark: 'brewer-exposed' },
            { kind: 'pay', share: -0.5 },
            { kind: 'memory', text: 'the night Oharu went home' },
          ],
          ledger: 'Oharu rests, and her husband is in the Watch’s cells. Only the Watch paid.',
        },
        {
          text: 'She breaks apart like mist in the cold. Gensai nails the boards back himself, pays every coin, and never once looks at the well.',
          effects: [{ kind: 'world', mark: 'brewer-hushed' }],
          ledger: 'Laid the ghost by force. The brewery is quiet, and the well is shut.',
        },
      ],
    },
  ],
};

export const SECOND_WELL: MissionDef = {
  id: 'brewer-second-well',
  title: 'The Weeping Well',
  rank: 'D',
  client: 'Sachi Mori',
  summary:
    'Gensai Mori’s new young wife hears a woman weeping in the well at night. She says it is warning her.',
  slots: 2,
  energyCost: 15,
  reward: { ryo: 120, reputation: 4 },
  minMissionsCompleted: 3,
  needsWorldMark: 'brewer-hushed',
  stages: [
    {
      kind: 'narrative',
      text: 'Sachi meets you at the back gate, not the front. “It says get out,” she whispers. “Every night. And my husband says I’m tired.”',
    },
    {
      kind: 'decision',
      text: 'The boards on the well are new, and nailed twice as thick. Sachi watches you look at them.',
      options: [
        {
          label: 'Tell her the truth about the well',
          tone: 'earnest',
          reply:
            'She listens to all of it without a sound, then goes inside and comes back with her travelling bag already packed. She takes it to the Watch herself.',
          effects: [
            { kind: 'world', mark: 'brewer-exposed' },
            { kind: 'tally', tally: MERCY, by: 1 },
          ],
          ledger: 'Told Sachi what is in the well. She went to the Watch.',
        },
        {
          label: 'Say it is only the wind',
          tone: 'quiet',
          reply: 'She thanks you, not believing you either.',
          ledger: 'Told Sachi it was only the wind.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          text: 'That night, for the first time in a month, the well is quiet.',
        },
      ],
    },
  ],
};

export const OHARUS_CASK: MissionDef = {
  id: 'brewer-oharus-cask',
  title: 'Oharu’s Cask',
  rank: 'D',
  client: 'Oyuki',
  summary:
    'The old Mori brewery is brewing again, under Oharu’s name. Oyuki asks you to carry the first cask to the shrine.',
  slots: 1,
  energyCost: 10,
  reward: { ryo: 80, reputation: 4 },
  minMissionsCompleted: 3,
  needsWorldMark: 'brewer-exposed',
  stages: [
    {
      kind: 'decision',
      text: 'The first cask from Oharu’s father’s rice is heavy, and the shrine steps are many. Oyuki walks beside you, saying nothing, until the top.',
      options: [
        {
          label: 'Set it down for her',
          tone: 'kind',
          reply: '“She’d have hated the fuss,” Oyuki says, and pours the first cup on the stones.',
          effects: [{ kind: 'memory', text: 'carrying Oharu’s first cask up the shrine steps' }],
          ledger: 'Carried Oharu’s first cask to the shrine.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [{ text: 'The well in the yard has a lid of new cedar now, and flowers on it.' }],
    },
  ],
};
