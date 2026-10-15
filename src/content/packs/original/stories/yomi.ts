import type { ConversationDef } from '../../../types';

import { YOMI_UNFINISHED } from './marks';

/** Yomi’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const YOMI_STORY: readonly ConversationDef[] = [
  {
    id: 'yomi-grandmother',
    personId: 'yomi',
    minStage: 1,
    opener:
      'Yomi finishes a sentence to the empty bench beside her and turns to you. “My grandmother. She likes you, I think.”',
    choices: [
      {
        label: 'Bow to the bench.',
        tone: 'kind',
        reply: 'Yomi smiles properly for the first time. “She says you have manners.”',
      },
      {
        label: '“There’s nobody there.”',
        tone: 'challenge',
        reply: '“Not for you,” Yomi says, without offence.',
      },
      {
        label: '“What does she say?”',
        tone: 'curious',
        reply: '“That you don’t eat enough.” Yomi shrugs. “She says that to everyone.”',
      },
    ],
  },
  {
    id: 'yomi-sight',
    personId: 'yomi',
    minStage: 2,
    opener:
      '“The Tōkaku see the dead,” Yomi says. “Not by choosing. I can’t close my eyes to them. Genjutsu is the only quiet I know.”',
    choices: [
      {
        label: '“That sounds lonely.”',
        tone: 'kind',
        reply: '“Crowded,” she says. “Which is worse.”',
      },
      {
        label: '“Teach me the quiet.”',
        tone: 'earnest',
        reply: 'She considers you. “Perhaps. It isn’t easy to give.”',
      },
      {
        label: 'Sit in silence with her.',
        tone: 'quiet',
        reply: 'After a while she breathes out, slowly. “Thank you.”',
      },
    ],
  },
  {
    id: 'yomi-teammate-grave',
    personId: 'yomi',
    minStage: 3,
    opener:
      '“The grave nobody visits,” Yomi says, “is my teammate’s. I don’t go. He’s never there. That’s the worst part.”',
    choices: [
      {
        label: '“Where is he, then?”',
        tone: 'curious',
        reply: '“Somewhere he hasn’t finished,” she says. “I keep looking.”',
      },
      {
        label: '“I’ll go with you.”',
        tone: 'kind',
        reply: 'She looks at you a long moment. “One day. Maybe.”',
      },
      {
        label: 'Say nothing.',
        tone: 'quiet',
        reply: 'She nods, as if that were the right answer.',
      },
    ],
  },
  {
    id: 'yomi-lantern-promise',
    personId: 'yomi',
    minStage: 4,
    opener:
      '“When I’m gone,” Yomi says, “light a lantern for me. Not on the grave. Somewhere I liked.” She pauses. “I found where he is. My teammate. On the old border hill. Come with me?”',
    choices: [
      {
        label: '“Where did you like?”',
        tone: 'curious',
        reply: 'She tells you. It is the bench where you first met.',
        worldMark: YOMI_UNFINISHED,
      },
      {
        label: '“Don’t talk like that.”',
        tone: 'earnest',
        reply: '“Everyone goes,” she says gently. “I just know where.”',
        worldMark: YOMI_UNFINISHED,
      },
      {
        label: '“I promise.”',
        tone: 'kind',
        reply: '“I know,” she says. “Grandmother says so too.”',
        worldMark: YOMI_UNFINISHED,
      },
    ],
  },
];
