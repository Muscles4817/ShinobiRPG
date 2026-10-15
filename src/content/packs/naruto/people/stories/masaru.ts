import type { ConversationDef } from '../../../../types';

import { MASARU_LETTER } from './marks';

/** Masaru’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const MASARU_STORY: readonly ConversationDef[] = [
  {
    id: 'masaru-score',
    personId: 'masaru',
    minStage: 1,
    opener:
      'Masaru points at the fence: tally marks, hundreds of them. “Every duel I’ve won in this village. The blank space is for you.”',
    choices: [
      {
        label: '“I’ll fill it with my wins.”',
        tone: 'challenge',
        reply: 'He roars with laughter. “Good! Try!”',
      },
      {
        label: '“How many have you lost?”',
        tone: 'tease',
        reply: '“Those go on a different fence,” he says. “A small one.”',
      },
      {
        label: '“That’s a lot of duels.”',
        tone: 'praise',
        reply: '“Not enough,” he says, delighted anyway.',
      },
    ],
  },
  {
    id: 'masaru-school',
    personId: 'masaru',
    minStage: 2,
    opener:
      '“My father runs a sword school on the post road,” Masaru says. “Three hundred years of one style. I was meant to be the next master.”',
    choices: [
      {
        label: '“Why aren’t you?”',
        tone: 'curious',
        reply: '“I wanted to fight for something,” he says. “Not just fight well.”',
      },
      {
        label: '“Show me the style.”',
        tone: 'earnest',
        reply: 'He does, slowly. It is beautiful and very old.',
      },
      {
        label: '“Bet you were a terrible student.”',
        tone: 'tease',
        reply: '“The worst,” he says proudly.',
      },
    ],
  },
  {
    id: 'masaru-father',
    personId: 'masaru',
    minStage: 3,
    opener:
      '“I walked out the day I was meant to inherit,” Masaru says, quieter than you’ve heard him. “My father hasn’t written since. Not once.”',
    choices: [
      {
        label: '“Have you written to him?”',
        tone: 'curious',
        reply: 'He opens his mouth, then shuts it. “No.”',
      },
      {
        label: '“He’ll come round.”',
        tone: 'kind',
        reply: '“He’s a samurai,” Masaru says. “They don’t come round. They come at you.”',
      },
      {
        label: 'Spar with him in silence.',
        tone: 'quiet',
        reply: 'He fights like a man trying not to think. You let him.',
      },
    ],
  },
  {
    id: 'masaru-letter',
    personId: 'masaru',
    minStage: 4,
    opener:
      'Masaru holds a letter he hasn’t opened. “From my father. First in years. Someone has challenged his school. I don’t want to go alone.”',
    choices: [
      {
        label: '“Open it. I’m here.”',
        tone: 'kind',
        reply: 'He does. His hands are steadier than his voice.',
        worldMark: MASARU_LETTER,
      },
      {
        label: '“We’ll fight them together.”',
        tone: 'earnest',
        reply: '“Together,” he says. “Yes.”',
        worldMark: MASARU_LETTER,
      },
      {
        label: '“You’re scared of your dad.”',
        tone: 'tease',
        reply: '“Terrified,” he admits, and laughs, and it helps.',
        worldMark: MASARU_LETTER,
      },
    ],
  },
];
