import type { ConversationDef } from '../../../../types';

/** Asuma’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const ASUMA_STORY: readonly ConversationDef[] = [
  {
    id: 'asuma-shogi',
    personId: 'asuma',
    minStage: 1,
    opener:
      'Asuma sets up a shōgi board. “Every piece matters. But one piece you protect above all. Guess which.”',
    choices: [
      {
        label: '“The king.”',
        tone: 'earnest',
        reply: '“Right,” he says. “And one day I’ll tell you what the king really is.”',
      },
      {
        label: '“The strongest one.”',
        tone: 'challenge',
        reply: '“Wrong,” he says cheerfully. “Play and find out.”',
      },
      {
        label: 'Move a piece instead of answering.',
        tone: 'quiet',
        reply: 'He grins and moves one back. You lose. Slowly.',
      },
    ],
  },
  {
    id: 'asuma-guardians',
    personId: 'asuma',
    minStage: 2,
    opener:
      '“I left the village once,” Asuma says. “Guarded a lord in the capital. Twelve of us. I came back with these knives and fewer friends.”',
    choices: [
      {
        label: '“Why did you leave?”',
        tone: 'curious',
        reply: '“To be someone other than my father’s son,” he says.',
      },
      {
        label: '“Why come back?”',
        tone: 'curious',
        reply: '“Turned out I liked it here.” He lights a cigarette. “Don’t tell him.”',
      },
      {
        label: '“Show me the knives.”',
        tone: 'challenge',
        reply: 'He does. They hum when he puts chakra through them.',
      },
    ],
  },
  {
    id: 'asuma-father',
    personId: 'asuma',
    minStage: 3,
    opener:
      '“My father’s the Hokage,” Asuma says. “We fight every time we talk. Still. He taught me everything I didn’t want to learn.”',
    choices: [
      { label: '“Maybe tell him that.”', tone: 'kind', reply: '“Maybe,” he says. “Someday.”' },
      { label: '“Families are hard.”', tone: 'earnest', reply: '“Yeah,” he says. “They are.”' },
      {
        label: 'Offer him the next shōgi move.',
        tone: 'quiet',
        reply: 'He takes it gratefully. You don’t talk about it again.',
      },
    ],
  },
  {
    id: 'asuma-king',
    personId: 'asuma',
    minStage: 4,
    opener:
      '“The king,” Asuma says. “It isn’t the Hokage. It’s the children of the village. The ones who come after. That’s you now.”',
    choices: [
      {
        label: '“Then I’ll protect the next ones.”',
        tone: 'earnest',
        reply: 'He smiles, the real kind. “That’s the will of fire.”',
      },
      {
        label: '“So you’re protecting me?”',
        tone: 'tease',
        reply: '“Don’t let it go to your head.”',
      },
      {
        label: 'Say nothing, and play.',
        tone: 'quiet',
        reply: 'This time, you win. He lets you think he didn’t let you.',
      },
    ],
  },
];
