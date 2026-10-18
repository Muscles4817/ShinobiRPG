import type { ConversationDef } from '../../../../types';

/** Guy’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const GUY_STORY: readonly ConversationDef[] = [
  {
    id: 'guy-count',
    personId: 'guy',
    minStage: 1,
    opener:
      '“Fifty wins and forty-nine losses!” Guy announces to nobody in particular. “Against my eternal rival! Or forty-nine wins, I suppose, depending on who you ask, but I know which of us is counting properly!”',
    choices: [
      {
        label: '“Who’s your rival?”',
        tone: 'curious',
        reply: '“Kakashi! The coolest, most infuriatingly aloof man in the whole village!”',
      },
      {
        label: '“I want a rival too.”',
        tone: 'earnest',
        reply: 'He weeps with joy on the spot. “Then you shall have one, I swear it!”',
      },
      {
        label: '“Who’s counting?”',
        tone: 'tease',
        reply: '“Everyone who loves youth is counting!” he says, deeply wounded.',
      },
    ],
  },
  {
    id: 'guy-father',
    personId: 'guy',
    minStage: 2,
    opener:
      '“My father was a genin all his life,” Guy says. “Might Duy. They called him the Eternal Genin and laughed when they said it, and he was the greatest man I ever knew.”',
    choices: [
      {
        label: '“What did he teach you?”',
        tone: 'curious',
        reply: '“That hard work beats talent, and that you never, ever stop!”',
      },
      {
        label: '“He sounds like you.”',
        tone: 'praise',
        reply:
          'Guy goes very quiet, and then beams at you. “That is the best thing anyone has ever said to me.”',
      },
      {
        label: '“Rank isn’t everything.”',
        tone: 'earnest',
        reply: '“No!” he cries. “It is nothing at all, compared with what a person does!”',
      },
    ],
  },
  {
    id: 'guy-gates',
    personId: 'guy',
    minStage: 3,
    opener:
      '“The Eight Gates,” Guy says, and he is unusually still while he says it. “Every one you open costs you, and the last one costs you everything. My father opened it once.”',
    choices: [
      {
        label: '“Would you?”',
        tone: 'curious',
        reply: '“To protect what is precious to me? Without a second thought.”',
      },
      {
        label: '“Don’t.”',
        tone: 'kind',
        reply: 'He ruffles your hair. “Then let’s both hope I never need to.”',
      },
      {
        label: 'Listen.',
        tone: 'quiet',
        reply: 'He tells you more than he tells most people, and you keep it to yourself.',
      },
    ],
  },
  {
    id: 'guy-precious',
    personId: 'guy',
    minStage: 4,
    opener:
      '“There are things you protect with your life,” Guy says. “Find yours, and then train so hard that nobody can ever take them from you.”',
    choices: [
      {
        label: '“I think I’ve found them.”',
        tone: 'earnest',
        reply: 'He gives you the thumbs up, and his teeth actually catch the sun.',
      },
      {
        label: '“How many laps is that?”',
        tone: 'joke',
        reply: '“All of them!” he roars, delighted with you.',
      },
      {
        label: '“You’re one of them.”',
        tone: 'kind',
        reply: 'He is crying before you finish, and if you are honest, so are you, a little.',
      },
    ],
  },
];
