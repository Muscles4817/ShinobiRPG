import type { ConversationDef } from '../../../../types';

import { MASARU_LETTER } from './marks';

/** Masaru’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const MASARU_STORY: readonly ConversationDef[] = [
  {
    id: 'masaru-score',
    personId: 'masaru',
    minStage: 1,
    opener:
      'Masaru points at the fence, which is covered in hundreds of tally marks. “Every duel I’ve won in this village. See that blank space at the end? That’s for you.”',
    choices: [
      {
        label: '“I’ll fill it with my wins.”',
        tone: 'challenge',
        reply: 'He roars with laughter. “Good! Try it, then!”',
      },
      {
        label: '“How many have you lost?”',
        tone: 'tease',
        reply: '“Those go on a different fence. A small one, round the back.”',
      },
      {
        label: '“That’s a lot of duels.”',
        tone: 'praise',
        reply: '“Not nearly enough,” he says, delighted with you anyway.',
      },
    ],
  },
  {
    id: 'masaru-school',
    personId: 'masaru',
    minStage: 2,
    opener:
      '“My father runs a sword school on the post road,” Masaru says. “Three hundred years of the one style, and I was meant to be the next master of it.”',
    choices: [
      {
        label: '“Why aren’t you?”',
        tone: 'curious',
        reply:
          '“I wanted to fight for something, not just fight well. My father never saw the difference.”',
      },
      {
        label: '“Show me the style.”',
        tone: 'earnest',
        reply: 'He does, slowly, and it is beautiful and very old.',
      },
      {
        label: '“Bet you were a terrible student.”',
        tone: 'tease',
        reply: '“The worst they ever had,” he says proudly.',
      },
    ],
  },
  {
    id: 'masaru-father',
    personId: 'masaru',
    minStage: 3,
    opener:
      '“I walked out on the day I was meant to inherit,” Masaru says, more quietly than you’ve ever heard him speak. “My father hasn’t written to me since, not once.”',
    choices: [
      {
        label: '“Have you written to him?”',
        tone: 'curious',
        reply: 'He opens his mouth to answer, then shuts it again. “No. I haven’t.”',
      },
      {
        label: '“He’ll come round.”',
        tone: 'kind',
        reply: '“He’s a samurai. They don’t come round, they come at you.”',
      },
      {
        label: 'Spar with him in silence.',
        tone: 'quiet',
        reply: 'He fights like a man trying hard not to think, and you let him.',
      },
    ],
  },
  {
    id: 'masaru-letter',
    personId: 'masaru',
    minStage: 4,
    opener:
      'Masaru is holding a letter he hasn’t opened. “From my father, the first in years. Someone has challenged his school, and I don’t want to go back there alone.”',
    choices: [
      {
        label: '“Open it. I’m here.”',
        tone: 'kind',
        reply: 'He opens it, and his hands are steadier than his voice when he reads it out.',
        worldMark: MASARU_LETTER,
      },
      {
        label: '“We’ll fight them together.”',
        tone: 'earnest',
        reply: '“Together,” he says. “Yes, all right. Together.”',
        worldMark: MASARU_LETTER,
      },
      {
        label: '“You’re scared of your dad.”',
        tone: 'tease',
        reply: '“Terrified,” he admits, and laughs, and that seems to help.',
        worldMark: MASARU_LETTER,
      },
    ],
  },
];
