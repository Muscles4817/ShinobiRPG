import type { ConversationDef } from '../../../../types';

/** Asuma’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const ASUMA_STORY: readonly ConversationDef[] = [
  {
    id: 'asuma-shogi',
    personId: 'asuma',
    minStage: 1,
    opener:
      'Asuma sets up a shōgi board on the bench between you. “Every piece on here matters. But there’s one you protect above all the others. Go on, guess which.”',
    choices: [
      {
        label: '“The king.”',
        tone: 'earnest',
        reply: '“Right. And one of these days I’ll tell you what the king really is.”',
      },
      {
        label: '“The strongest one.”',
        tone: 'challenge',
        reply: '“Wrong,” he says cheerfully. “Play a few games and you’ll work it out.”',
      },
      {
        label: 'Move a piece instead of answering.',
        tone: 'quiet',
        reply:
          'He moves one back, looking amused, and then takes the rest of the afternoon to beat you, very slowly.',
      },
    ],
  },
  {
    id: 'asuma-guardians',
    personId: 'asuma',
    minStage: 2,
    opener:
      '“I left the village once,” Asuma says. “Went to guard the daimyō in the capital, twelve of us all told. I came back with these knives and fewer friends than I left with.”',
    choices: [
      {
        label: '“Why did you leave?”',
        tone: 'curious',
        reply: '“To be somebody other than my father’s son, I suppose.”',
      },
      {
        label: '“Why come back?”',
        tone: 'curious',
        reply:
          '“Turned out I liked it here.” He lights a cigarette. “Don’t go telling my father that.”',
      },
      {
        label: '“Show me the knives.”',
        tone: 'challenge',
        reply: 'He does, and when he puts chakra through them the blades start to hum.',
      },
    ],
  },
  {
    id: 'asuma-father',
    personId: 'asuma',
    minStage: 3,
    opener:
      '“My father’s the Hokage,” Asuma says. “We still fight every time we talk, even now. He taught me everything I didn’t want to learn from him.”',
    choices: [
      {
        label: '“Maybe tell him that.”',
        tone: 'kind',
        reply: '“Maybe I will. Someday, when we’re both too tired to argue.”',
      },
      {
        label: '“Families are hard.”',
        tone: 'earnest',
        reply: '“Yeah. They are, aren’t they.”',
      },
      {
        label: 'Offer him the next shōgi move.',
        tone: 'quiet',
        reply: 'He takes it gratefully, and neither of you brings it up again.',
      },
    ],
  },
  {
    id: 'asuma-king',
    personId: 'asuma',
    minStage: 4,
    opener:
      '“The king,” Asuma says. “It isn’t the Hokage. It’s the children of the village, the ones who come after us. That means you, now.”',
    choices: [
      {
        label: '“Then I’ll protect the next ones.”',
        tone: 'earnest',
        reply: 'He smiles, the real kind. “That’s the will of fire.”',
      },
      {
        label: '“So you’re protecting me?”',
        tone: 'tease',
        reply: '“Don’t let it go to your head, all right?”',
      },
      {
        label: 'Say nothing, and play.',
        tone: 'quiet',
        reply: 'This time you win, and he lets you go on thinking he didn’t let you.',
      },
    ],
  },
];
