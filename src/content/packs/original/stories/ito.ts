import type { ConversationDef } from '../../../types';

import { ITO_SEAL } from './marks';

/** Ito’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const ITO_STORY: readonly ConversationDef[] = [
  {
    id: 'ito-seal',
    personId: 'ito',
    minStage: 1,
    opener:
      'Ito presses a slip of paper to the post and it starts to hum. “That one keeps the tea hot. I have a seal for nearly everything, you know.”',
    choices: [
      {
        label: '“Teach me that one.”',
        tone: 'earnest',
        reply:
          '“First the one for keeping all your fingers,” she says. “Then we’ll see about tea.”',
      },
      {
        label: '“Everything?”',
        tone: 'tease',
        reply:
          '“Nearly everything. Go on, try me.” You try, and can’t name a single thing she doesn’t have a seal for.',
      },
      {
        label: '“How does it work?”',
        tone: 'curious',
        reply: 'She explains for an hour, and you follow most of it.',
      },
    ],
  },
  {
    id: 'ito-ropes',
    personId: 'ito',
    minStage: 2,
    opener:
      '“The Shimenawa weave the ropes that hold the restless dead,” Ito says. “My mother did, and her mother before her, and I write seals instead. Nobody in the family has forgiven me yet.”',
    choices: [
      {
        label: '“Seals are ropes too, in a way.”',
        tone: 'earnest',
        reply: 'She stops short. “That is exactly what I told them. Exactly that.”',
      },
      {
        label: '“Do you want them to?”',
        tone: 'curious',
        reply: '“Some days I do. Not today, though.”',
      },
      {
        label: '“Their loss.”',
        tone: 'praise',
        reply: 'She hides a smile behind her sleeve.',
      },
    ],
  },
  {
    id: 'ito-failed-seal',
    personId: 'ito',
    minStage: 3,
    opener:
      '“A seal of mine failed once,” Ito says, “and a thing got out that should have stayed in. That’s why I check every seal I write three times.”',
    choices: [
      {
        label: '“What got out?”',
        tone: 'curious',
        reply: '“A patient thing. It’s still being patient, wherever it is.”',
      },
      {
        label: '“Everyone fails once.”',
        tone: 'kind',
        reply: '“Most people’s failures don’t sit and wait for them,” she says, not unkindly.',
      },
      {
        label: '“Teach me to check.”',
        tone: 'earnest',
        reply: 'She does, that same night, at the table under the lantern.',
      },
    ],
  },
  {
    id: 'ito-trust',
    personId: 'ito',
    minStage: 4,
    opener:
      'Ito puts a sealed slip in your hand. “If anything happens to me, burn this without reading it.” Her voice drops. “The thing that got out has started moving again, and I need somebody I trust beside me.”',
    choices: [
      {
        label: '“I won’t read it.”',
        tone: 'earnest',
        reply: '“I know you won’t. That’s why it’s you I gave it to.”',
        worldMark: ITO_SEAL,
      },
      {
        label: '“Nothing will happen to you.”',
        tone: 'kind',
        reply: '“Then you’ll never need it, and that suits me very well.”',
        worldMark: ITO_SEAL,
      },
      {
        label: 'Tuck it away without a word.',
        tone: 'quiet',
        reply: 'She watches where you put it, and seems satisfied.',
        worldMark: ITO_SEAL,
      },
    ],
  },
];
