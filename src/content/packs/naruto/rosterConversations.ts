import type { ConversationDef } from '../../types';

/** What the village's jōnin say when you first approach them, including the favours they ask. */
export const ROSTER_CONVERSATIONS: readonly ConversationDef[] = [
  {
    id: 'ibiki-question',
    personId: 'ibiki',
    minStage: 0,
    opener:
      'Ibiki studies you until it becomes uncomfortable. “Your teammate told me what you did last week. Did they lie?”',
    choices: [
      {
        label: '“Ask them yourself.”',
        tone: 'quiet',
        reply:
          'Approval, or what passes for it, crosses the scars. “Good. You’d be surprised how few people say that to me.”',
        favour: 'ibiki-silence',
      },
      {
        label: '“They lied. Here’s what really happened…”',
        tone: 'earnest',
        reply: '“Nobody told me anything,” he says. “You just did.” Then he walks away.',
      },
      {
        label: '“Is this a test?”',
        tone: 'curious',
        reply:
          '“Everything is a test.” He waits, and you can tell from his face that you didn’t pass this one.',
      },
    ],
  },
  {
    id: 'shikaku-shogi',
    personId: 'shikaku',
    minStage: 0,
    opener: 'Shikaku has a shōgi board set up and nobody sitting across from him. “You play?”',
    choices: [
      {
        label: 'Sit down and play.',
        tone: 'earnest',
        reply:
          'You lose in a few dozen moves. He studies the board for a while after. “Huh. You lost in an interesting way, at least.”',
        favour: 'shikaku-shogi',
      },
      {
        label: '“Not against you.”',
        tone: 'joke',
        reply: '“Smart,” he says through a yawn. “Smarter than my son, anyway. He plays.”',
      },
    ],
  },
  {
    id: 'genma-senbon',
    personId: 'genma',
    minStage: 0,
    opener: 'Genma shifts the needle to the other side of his mouth. “You want something, kid?”',
    choices: [
      {
        label: '“Doesn’t that thing hurt?”',
        tone: 'curious',
        reply: '“Only the other guy, and only when I throw it.”',
      },
      {
        label: '“Teach me to throw like you.”',
        tone: 'challenge',
        reply:
          'The senbon tips up as he smiles around it. “Bring coin. Needles bend, and I’m not buying yours.”',
      },
    ],
  },
  {
    id: 'chouza-welcome',
    personId: 'choza',
    minStage: 0,
    opener: 'Chōza claps you on the back hard enough to rattle your teeth. “Have you eaten yet?”',
    choices: [
      {
        label: '“Not yet!”',
        tone: 'earnest',
        reply: '“Then that’s the first problem solved,” he laughs, and hands you half a meat bun.',
      },
      {
        label: '“I’m on a diet.”',
        tone: 'joke',
        reply: 'He looks genuinely wounded. “Don’t you ever say that word near my son.”',
      },
    ],
  },
];
