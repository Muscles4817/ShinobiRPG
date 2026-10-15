import type { ConversationDef } from '../../../types';

import { ITO_SEAL } from './marks';

/** Ito’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const ITO_STORY: readonly ConversationDef[] = [
  {
    id: 'ito-seal',
    personId: 'ito',
    minStage: 1,
    opener:
      'Ito presses a slip of paper to the post. It hums. “A seal for keeping tea hot. I have one for everything.”',
    choices: [
      {
        label: '“Teach me that one.”',
        tone: 'earnest',
        reply: '“First the one for keeping your fingers,” she says.',
      },
      {
        label: '“Everything?”',
        tone: 'tease',
        reply: '“Everything,” she says. “Try me.” You can’t think of anything she lacks.',
      },
      {
        label: '“How does it work?”',
        tone: 'curious',
        reply: 'She explains for an hour. You follow most of it.',
      },
    ],
  },
  {
    id: 'ito-ropes',
    personId: 'ito',
    minStage: 2,
    opener:
      '“The Shimenawa weave the ropes that hold the restless dead,” Ito says. “My mother did, and hers. I write seals instead. Nobody has forgiven me.”',
    choices: [
      {
        label: '“Seals are ropes too, in a way.”',
        tone: 'earnest',
        reply: 'She stops. “That,” she says, “is exactly what I told them.”',
      },
      {
        label: '“Do you want them to?”',
        tone: 'curious',
        reply: '“Some days,” she says. “Not today.”',
      },
      { label: '“Their loss.”', tone: 'praise', reply: 'She smiles behind her sleeve.' },
    ],
  },
  {
    id: 'ito-failed-seal',
    personId: 'ito',
    minStage: 3,
    opener:
      '“A seal of mine failed once,” Ito says. “Something got out. That is why I check every one three times.”',
    choices: [
      {
        label: '“What got out?”',
        tone: 'curious',
        reply: '“Something patient,” she says. “It is still patient.”',
      },
      {
        label: '“Everyone fails once.”',
        tone: 'kind',
        reply: '“Most people’s failures don’t wait for them,” she says, not unkindly.',
      },
      {
        label: '“Teach me to check.”',
        tone: 'earnest',
        reply: 'She does, that same night, by lantern light.',
      },
    ],
  },
  {
    id: 'ito-trust',
    personId: 'ito',
    minStage: 4,
    opener:
      'Ito puts a sealed slip in your hand. “If anything happens to me, burn this. Don’t read it.” Her voice drops. “The thing that got out has started moving. I need someone I trust beside me.”',
    choices: [
      {
        label: '“I won’t read it.”',
        tone: 'earnest',
        reply: '“I know,” she says. “That’s why it’s you.”',
        worldMark: ITO_SEAL,
      },
      {
        label: '“Nothing will happen to you.”',
        tone: 'kind',
        reply: '“Then you’ll never need it,” she says. “Good.”',
        worldMark: ITO_SEAL,
      },
      {
        label: 'Tuck it away without a word.',
        tone: 'quiet',
        reply: 'She watches where you put it, and nods.',
        worldMark: ITO_SEAL,
      },
    ],
  },
];
