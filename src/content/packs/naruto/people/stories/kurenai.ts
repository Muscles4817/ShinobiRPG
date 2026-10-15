import type { ConversationDef } from '../../../../types';

/** Kurenai’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const KURENAI_STORY: readonly ConversationDef[] = [
  {
    id: 'kurenai-care',
    personId: 'kurenai',
    minStage: 1,
    opener:
      '“Genjutsu is not cruelty,” Kurenai says. “It is understanding a mind well enough to change what it sees. Care, used sharply.”',
    choices: [
      {
        label: '“Teach me to see the seams.”',
        tone: 'earnest',
        reply: '“Every day,” she says, “until you do.”',
      },
      {
        label: '“Isn’t it lying?”',
        tone: 'challenge',
        reply: '“Sometimes,” she says. “So is kindness. Choose well.”',
      },
      { label: '“That’s beautiful.”', tone: 'praise', reply: 'She smiles. “It can be.”' },
    ],
  },
  {
    id: 'kurenai-father',
    personId: 'kurenai',
    minStage: 2,
    opener:
      '“My father was a genjutsu master,” Kurenai says. “He never told me I was good enough. I decided to be anyway.”',
    choices: [
      {
        label: '“You’re better than good enough.”',
        tone: 'praise',
        reply: '“Thank you,” she says, and means it.',
      },
      {
        label: '“Is that why you’re kind to us?”',
        tone: 'curious',
        reply: '“Yes,” she says simply.',
      },
      { label: 'Nod.', tone: 'quiet', reply: 'She nods back. It is enough between you.' },
    ],
  },
  {
    id: 'kurenai-asuma',
    personId: 'kurenai',
    minStage: 3,
    opener:
      'You catch Kurenai watching Asuma across the street. She notices you noticing. “Not a word,” she says.',
    choices: [
      { label: '“Not a word.”', tone: 'kind', reply: 'She smiles, grateful, and a little pink.' },
      {
        label: '“He should know.”',
        tone: 'tease',
        reply: '“He knows,” she says. “He’s just slow.”',
      },
      {
        label: '“Do you love him?”',
        tone: 'curious',
        reply: 'She doesn’t answer. She doesn’t have to.',
      },
    ],
  },
  {
    id: 'kurenai-family',
    personId: 'kurenai',
    minStage: 4,
    opener:
      '“My team is my family,” Kurenai says. “I will not lose any of you. Promise me you will come home from every job.”',
    choices: [
      {
        label: '“I promise.”',
        tone: 'earnest',
        reply: 'She holds you to it with a look you will remember.',
      },
      { label: '“You’ll be there to make sure.”', tone: 'kind', reply: '“Always,” she says.' },
      { label: '“Even the boring ones?”', tone: 'joke', reply: '“Especially those,” she laughs.' },
    ],
  },
];
