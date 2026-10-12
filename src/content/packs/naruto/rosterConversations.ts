import type { ConversationDef } from '../../types';

/** What the village's jōnin say when you first approach them, including the favours they ask. */
export const ROSTER_CONVERSATIONS: readonly ConversationDef[] = [
  {
    id: 'ibiki-question',
    personId: 'ibiki',
    minStage: 0,
    opener:
      'Ibiki looks at you for a long time. "Your teammate told me what you did last week. Did they lie?"',
    choices: [
      {
        label: '“Ask them yourself.”',
        tone: 'quiet',
        reply:
          'Something like approval crosses the scars. "Good. You’d be surprised how few say that."',
        favour: 'ibiki-silence',
      },
      {
        label: '“They lied. Here’s what really happened…”',
        tone: 'earnest',
        reply: '"Nobody told me anything," he says. "You just did." He walks away.',
      },
      {
        label: '“Is this a test?”',
        tone: 'curious',
        reply: '"Everything is a test." He waits. You don’t pass this one.',
      },
    ],
  },
  {
    id: 'shikaku-shogi',
    personId: 'shikaku',
    minStage: 0,
    opener: 'Shikaku has a shōgi board set up and nobody across from him. "You play?"',
    choices: [
      {
        label: 'Sit down and play.',
        tone: 'earnest',
        reply:
          'You lose in a few dozen moves. He studies the board after. "Huh. You lost in an interesting way."',
        favour: 'shikaku-shogi',
      },
      {
        label: '“Not against you.”',
        tone: 'joke',
        reply: '"Smart," he yawns. "Smarter than my son, anyway. He plays."',
      },
    ],
  },
  {
    id: 'genma-senbon',
    personId: 'genma',
    minStage: 0,
    opener: 'Genma shifts the needle to the other side of his mouth. "Need something, kid?"',
    choices: [
      {
        label: '“Doesn’t that thing hurt?”',
        tone: 'curious',
        reply: '"Only the other guy."',
      },
      {
        label: '“Teach me to throw like you.”',
        tone: 'challenge',
        reply: 'He grins around the senbon. "Bring coin. Needles bend."',
      },
    ],
  },
  {
    id: 'chouza-welcome',
    personId: 'choza',
    minStage: 0,
    opener: 'Chōza claps you on the back hard enough to rattle your teeth. "Eaten yet?"',
    choices: [
      {
        label: '“Not yet!”',
        tone: 'earnest',
        reply: '"Then that’s the first problem solved," he laughs, and hands you half a meat bun.',
      },
      {
        label: '“I’m on a diet.”',
        tone: 'joke',
        reply: 'He looks genuinely wounded. "Don’t ever say that word near my son."',
      },
    ],
  },
];
