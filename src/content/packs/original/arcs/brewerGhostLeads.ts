import type { MissionDef } from '@/systems/missions';

import { BREWER, BREWER_CLUES } from './brewerGhostStart';

/**
 * The Brewer's Ghost, the other two leads: the woman who brewed beside the dead wife, and the
 * gravedigger the brewer blames. Accusing the gravedigger is the hasty answer, and the wrong one.
 */

export const OLD_HANDS: MissionDef = {
  id: 'arc-brewer-old-hands',
  title: 'The Brewery’s Old Hands',
  rank: 'D',
  client: 'Tōrōgakure Watch',
  summary: 'Old Oyuki brewed at the Mori brewery for thirty years, until Gensai let her go.',
  slots: 2,
  energyCost: 10,
  reward: { ryo: 90, reputation: 2 },
  minMissionsCompleted: 3,
  stages: [
    {
      kind: 'decision',
      text: 'Oyuki sells pickles at the market now. When you say the name Mori, her knife stops on the board.',
      options: [
        {
          label: 'Ask what the first wife was like',
          tone: 'kind',
          reply:
            '“Oharu. She was the brewer. Her father’s brewery, her hands, her rice.” Oyuki puts the knife down. “He said she drowned in the river. Her sandals were by the well that morning. I saw them. Then I didn’t, and then I had no job.”',
          effects: [
            { kind: 'world', mark: 'brewer-oyuki-told' },
            { kind: 'mark', mark: 'told' },
            { kind: 'tally', tally: BREWER_CLUES, by: 1 },
          ],
          ledger: 'Oyuki told you Oharu’s sandals were by the well, not the river.',
        },
        {
          label: 'Tell her the Watch needs her to talk',
          tone: 'earnest',
          reply:
            '“The Watch needed me ten years ago,” she says. But she tells you about the sandals by the well, and the morning she was let go.',
          effects: [
            { kind: 'world', mark: 'brewer-oyuki-told' },
            { kind: 'mark', mark: 'told' },
            { kind: 'tally', tally: BREWER_CLUES, by: 1 },
          ],
          ledger: 'Oyuki told you Oharu’s sandals were by the well, not the river.',
        },
        {
          label: 'Ask if she has a grudge against Gensai',
          tone: 'challenge',
          reply: '“I sell pickles,” she says, and turns to the next customer.',
          ledger: 'Oyuki took offence and said nothing.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'told' },
          text: 'As you go she calls after you. “If it’s her,” she says, “tell her the rice still comes from her father’s fields.”',
        },
        { text: 'You leave the market with a jar of pickles you didn’t mean to buy.' },
      ],
    },
  ],
};

export const GRAVEDIGGER: MissionDef = {
  id: 'arc-brewer-gravedigger',
  title: 'The Gravedigger',
  rank: 'D',
  client: BREWER,
  summary:
    'Gensai Mori says old Jūbei the gravedigger cursed his brewery over an unpaid bill. He wants him dealt with.',
  slots: 2,
  energyCost: 15,
  reward: { ryo: 100, reputation: 2 },
  minMissionsCompleted: 3,
  stages: [
    {
      kind: 'narrative',
      text: 'Jūbei lives in a hut behind the cemetery with a jug and a dog. He looks exactly like a man who curses breweries.',
    },
    {
      kind: 'decision',
      text: 'He squints at your headband. “Mori sent you,” he says. “Course he did.”',
      options: [
        {
          label: 'Accuse him of cursing the brewery',
          tone: 'challenge',
          reply:
            'Jūbei swears he has never cursed anything but his knees. You drag him to the Watch anyway. Gensai pays the bounty with a smile you will remember later.',
          effects: [
            { kind: 'world', mark: 'brewer-wrong-man' },
            { kind: 'mark', mark: 'accused' },
            { kind: 'pay', share: 0.5 },
          ],
          ledger: 'Hauled the gravedigger to the Watch for the brewer.',
        },
        {
          label: 'Ask why Mori would send anyone',
          tone: 'curious',
          reply:
            '“Because I buried his wife,” Jūbei says. “Or I buried a coffin with his name on the bill. Light as an empty box. He paid me extra to carry it like it wasn’t.”',
          effects: [
            { kind: 'world', mark: 'brewer-empty-coffin' },
            { kind: 'tally', tally: BREWER_CLUES, by: 1 },
          ],
          ledger: 'Jūbei told you Oharu’s coffin was buried empty.',
        },
        {
          label: 'Share his jug, and let him talk',
          tone: 'joke',
          reply:
            'Three cups in, he tells you about the lightest coffin he ever carried, and who paid him to carry it heavy.',
          effects: [
            { kind: 'world', mark: 'brewer-empty-coffin' },
            { kind: 'tally', tally: BREWER_CLUES, by: 1 },
            { kind: 'energy', by: -5 },
          ],
          ledger: 'Over a jug, Jūbei told you Oharu’s coffin was buried empty.',
        },
      ],
    },
    {
      kind: 'ending',
      endings: [
        {
          when: { has: 'accused' },
          text: 'That night the brewery’s vats sour faster than ever. Whatever walks there didn’t like what you did.',
        },
        { text: 'Jūbei’s dog walks you to the cemetery gate and sits there watching you go.' },
      ],
    },
  ],
};
