import type { ConversationDef } from '../../../../types';

/** Kurenai’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const KURENAI_STORY: readonly ConversationDef[] = [
  {
    id: 'kurenai-care',
    personId: 'kurenai',
    minStage: 1,
    opener:
      '“Genjutsu isn’t cruelty,” Kurenai says. “It’s understanding a mind well enough to change what it sees. Think of it as care, used sharply.”',
    choices: [
      {
        label: '“Teach me to see the seams.”',
        tone: 'earnest',
        reply: '“Every day, until you can,” she says.',
      },
      {
        label: '“Isn’t it lying?”',
        tone: 'challenge',
        reply: '“Sometimes. So is kindness, sometimes. You have to choose well.”',
      },
      {
        label: '“That’s beautiful.”',
        tone: 'praise',
        reply: '“It can be,” she says, pleased you saw it.',
      },
    ],
  },
  {
    id: 'kurenai-father',
    personId: 'kurenai',
    minStage: 2,
    opener:
      '“My father was a genjutsu master,” Kurenai says, “and he never once told me I was good enough. So I decided to be anyway.”',
    choices: [
      {
        label: '“You’re better than good enough.”',
        tone: 'praise',
        reply: '“Thank you,” she says, and you can tell she means it.',
      },
      {
        label: '“Is that why you’re kind to us?”',
        tone: 'curious',
        reply: '“Yes,” she says simply. “I know what the other way costs.”',
      },
      {
        label: 'Nod.',
        tone: 'quiet',
        reply: 'She meets your eyes, and that is enough between you.',
      },
    ],
  },
  {
    id: 'kurenai-asuma',
    personId: 'kurenai',
    minStage: 3,
    opener:
      'You catch Kurenai watching Asuma across the street, and she catches you noticing. “Not a word,” she says.',
    choices: [
      {
        label: '“Not a word.”',
        tone: 'kind',
        reply: 'She smiles at you, grateful and a little pink.',
      },
      {
        label: '“He should know.”',
        tone: 'tease',
        reply: '“Oh, he knows. He’s just slow about it.”',
      },
      {
        label: '“Do you love him?”',
        tone: 'curious',
        reply: 'She doesn’t answer, and she doesn’t need to.',
      },
    ],
  },
  {
    id: 'kurenai-family',
    personId: 'kurenai',
    minStage: 4,
    opener:
      '“My team is my family,” Kurenai says, “and I won’t lose any of you. Promise me you’ll come home from every job.”',
    choices: [
      {
        label: '“I promise.”',
        tone: 'earnest',
        reply: 'She holds you to it with a look you will remember for a long while.',
      },
      {
        label: '“You’ll be there to make sure.”',
        tone: 'kind',
        reply: '“Always. Every single time.”',
      },
      {
        label: '“Even the boring ones?”',
        tone: 'joke',
        reply: '“Especially those,” she says, laughing.',
      },
    ],
  },
];
