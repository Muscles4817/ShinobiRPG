import type { ConversationDef } from '../../../types';

import { YOMI_UNFINISHED } from './marks';

/** Yomi’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const YOMI_STORY: readonly ConversationDef[] = [
  {
    id: 'yomi-grandmother',
    personId: 'yomi',
    minStage: 1,
    opener:
      'Yomi finishes what she was saying to the empty bench beside her and turns to you. “My grandmother. I think she likes you, though it’s hard to be sure with her.”',
    choices: [
      {
        label: 'Bow to the bench.',
        tone: 'kind',
        reply:
          'Yomi smiles properly for the first time since you’ve known her. “She says you have manners, at least.”',
      },
      {
        label: '“There’s nobody there.”',
        tone: 'challenge',
        reply: '“Not for you, no,” Yomi says, without any offence.',
      },
      {
        label: '“What does she say?”',
        tone: 'curious',
        reply:
          '“That you don’t eat enough. Don’t take it to heart, she says that to everyone, me included.”',
      },
    ],
  },
  {
    id: 'yomi-sight',
    personId: 'yomi',
    minStage: 2,
    opener:
      '“The Tōkaku see the dead,” Yomi says. “We don’t choose it, and I can’t close my eyes to them. Genjutsu is the only quiet I’ve ever found.”',
    choices: [
      {
        label: '“That sounds lonely.”',
        tone: 'kind',
        reply: '“Crowded, I’d say. Which is worse, if you ask me.”',
      },
      {
        label: '“Teach me the quiet.”',
        tone: 'earnest',
        reply: 'She considers you. “Perhaps. It isn’t an easy thing to hand to somebody.”',
      },
      {
        label: 'Sit in silence with her.',
        tone: 'quiet',
        reply: 'After a while she lets out a slow breath and thanks you.',
      },
    ],
  },
  {
    id: 'yomi-teammate-grave',
    personId: 'yomi',
    minStage: 3,
    opener:
      '“The grave nobody visits is my teammate’s,” Yomi says. “I don’t go either, because he’s never there, and I think that’s the worst of it.”',
    choices: [
      {
        label: '“Where is he, then?”',
        tone: 'curious',
        reply: '“Somewhere he hasn’t finished with yet. I keep looking for it.”',
      },
      {
        label: '“I’ll go with you.”',
        tone: 'kind',
        reply: 'She looks at you for some time before she answers. “One day, maybe.”',
      },
      {
        label: 'Say nothing.',
        tone: 'quiet',
        reply: 'It seems to be the answer she wanted.',
      },
    ],
  },
  {
    id: 'yomi-lantern-promise',
    personId: 'yomi',
    minStage: 4,
    opener:
      '“When I’m gone,” Yomi says, “light a lantern for me, not on the grave but somewhere I liked.” She pauses. “I’ve found where he is, my teammate. On the old border hill. Will you come with me?”',
    choices: [
      {
        label: '“Where did you like?”',
        tone: 'curious',
        reply: 'She tells you, and it is the bench where you first met.',
        worldMark: YOMI_UNFINISHED,
      },
      {
        label: '“Don’t talk like that.”',
        tone: 'earnest',
        reply: '“Everyone goes,” she says gently. “I just happen to know where.”',
        worldMark: YOMI_UNFINISHED,
      },
      {
        label: '“I promise.”',
        tone: 'kind',
        reply: '“I know you will. Grandmother says so too.”',
        worldMark: YOMI_UNFINISHED,
      },
    ],
  },
];
