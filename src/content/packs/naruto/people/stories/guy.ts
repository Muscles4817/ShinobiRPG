import type { ConversationDef } from '../../../../types';

/** Guy’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const GUY_STORY: readonly ConversationDef[] = [
  {
    id: 'guy-count',
    personId: 'guy',
    minStage: 1,
    opener:
      '“Fifty wins, forty-nine losses!” Guy announces. “Against my eternal rival! Or forty-nine wins. It depends who you ask!”',
    choices: [
      {
        label: '“Who’s your rival?”',
        tone: 'curious',
        reply: '“Kakashi! The coolest, most aloof man in the village!”',
      },
      {
        label: '“I want a rival too.”',
        tone: 'earnest',
        reply: 'He weeps with joy. “Then you shall have one!”',
      },
      {
        label: '“Who’s counting?”',
        tone: 'tease',
        reply: '“Everyone who loves youth!” he says, deeply wounded.',
      },
    ],
  },
  {
    id: 'guy-father',
    personId: 'guy',
    minStage: 2,
    opener:
      '“My father was a genin all his life,” Guy says. “Might Duy. They called him the Eternal Genin. He was the greatest man I ever knew.”',
    choices: [
      {
        label: '“What did he teach you?”',
        tone: 'curious',
        reply: '“That hard work beats talent. And to never stop.”',
      },
      {
        label: '“He sounds like you.”',
        tone: 'praise',
        reply: 'Guy goes very quiet, then beams. “That is the best thing anyone has said to me.”',
      },
      {
        label: '“Rank isn’t everything.”',
        tone: 'earnest',
        reply: '“No!” he cries. “It is nothing at all!”',
      },
    ],
  },
  {
    id: 'guy-gates',
    personId: 'guy',
    minStage: 3,
    opener:
      '“The Eight Gates,” Guy says, unusually still. “Each one opened costs something. The last costs everything. My father opened it once.”',
    choices: [
      {
        label: '“Would you?”',
        tone: 'curious',
        reply: '“To protect what is precious?” He smiles. “Without a second thought.”',
      },
      {
        label: '“Don’t.”',
        tone: 'kind',
        reply: 'He ruffles your hair. “Let’s hope I never need to.”',
      },
      {
        label: 'Listen.',
        tone: 'quiet',
        reply: 'He tells you more than he tells most. You keep it close.',
      },
    ],
  },
  {
    id: 'guy-precious',
    personId: 'guy',
    minStage: 4,
    opener:
      '“There are things you protect with your life,” Guy says. “Find yours. Then train so hard nobody can take them from you.”',
    choices: [
      {
        label: '“I think I’ve found them.”',
        tone: 'earnest',
        reply: 'He gives the thumbs up. His teeth actually shine.',
      },
      {
        label: '“How many laps is that?”',
        tone: 'joke',
        reply: '“All of them!” he roars, delighted.',
      },
      {
        label: '“You’re one of them.”',
        tone: 'kind',
        reply: 'He is crying before you finish. So, a little, are you.',
      },
    ],
  },
];
