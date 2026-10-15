import type { ConversationDef } from '../../../../types';

/** Anko’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const ANKO_STORY: readonly ConversationDef[] = [
  {
    id: 'anko-dango',
    personId: 'anko',
    minStage: 1,
    opener:
      'Anko is on her fourth stick of dango. “Sweet things,” she says, “because the rest of the job isn’t.”',
    choices: [
      { label: 'Take a stick.', tone: 'joke', reply: 'She lets you. Barely. “You owe me.”' },
      {
        label: '“Is the job that bad?”',
        tone: 'curious',
        reply: '“Worse,” she says cheerfully. “You’ll love it.”',
      },
      {
        label: '“You’ll rot your teeth.”',
        tone: 'tease',
        reply: 'She bares them. They are perfect, and slightly alarming.',
      },
    ],
  },
  {
    id: 'anko-forest',
    personId: 'anko',
    minStage: 2,
    opener:
      '“Training Ground Forty-Four,” Anko says. “The Forest of Death. I’m the only one who walks in there for fun.”',
    choices: [
      { label: '“Take me with you.”', tone: 'challenge', reply: '“Ha! Bring a bandage. Several.”' },
      {
        label: '“Why for fun?”',
        tone: 'curious',
        reply: '“It’s honest,” she says. “Everything in there wants to eat you, and says so.”',
      },
      { label: '“No thank you.”', tone: 'joke', reply: '“Smart,” she says. “Boring, but smart.”' },
    ],
  },
  {
    id: 'anko-mark',
    personId: 'anko',
    minStage: 3,
    opener:
      'Anko touches the mark on her neck. “My teacher left that. Orochimaru. He used me and threw me away. It still burns when he’s near.”',
    choices: [
      {
        label: '“He was wrong to.”',
        tone: 'kind',
        reply: '“I know,” she says. “Took me years to know it.”',
      },
      {
        label: '“I’d have stopped him.”',
        tone: 'earnest',
        reply: 'She laughs, not unkindly. “Grow first.”',
      },
      {
        label: 'Stay close a while.',
        tone: 'quiet',
        reply: 'She doesn’t send you away. That says a lot.',
      },
    ],
  },
  {
    id: 'anko-used',
    personId: 'anko',
    minStage: 4,
    opener:
      '“Listen,” Anko says, deadly serious for once. “Never let anyone use you. Not a teacher. Not me. Not the village. Promise.”',
    choices: [
      {
        label: '“I promise.”',
        tone: 'earnest',
        reply: '“Good kid,” she says, and buys you dango.',
      },
      { label: '“Not even you?”', tone: 'tease', reply: '“Especially me,” she grins.' },
      {
        label: '“Nobody uses you either.”',
        tone: 'kind',
        reply: 'She stares at you. Then she ruffles your hair, hard.',
      },
    ],
  },
];
