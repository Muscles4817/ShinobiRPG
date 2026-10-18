import type { ConversationDef } from '../../../../types';

import { SHION_DEBT } from './marks';

/** Shion’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const SHION_STORY: readonly ConversationDef[] = [
  {
    id: 'shion-cards',
    personId: 'shion',
    minStage: 1,
    opener:
      'Shion fans a deck of cards at you and tells you to pick one. You do, and it’s blank. “Never trust a deck you didn’t shuffle yourself,” she says.',
    choices: [
      {
        label: '“How did you do that?”',
        tone: 'curious',
        reply: '“I didn’t do anything. You saw what you expected to see, that’s all.”',
      },
      {
        label: 'Shuffle her deck yourself.',
        tone: 'challenge',
        reply:
          'When you turn them over, every card is the same queen, and Shion looks very pleased with herself.',
      },
      {
        label: '“That’s cheating.”',
        tone: 'tease',
        reply: '“Yes. That’s the lesson,” she says.',
      },
    ],
  },
  {
    id: 'shion-tanzaku',
    personId: 'shion',
    minStage: 2,
    opener:
      '“I spent years in Tanzaku Town dealing cards and pouring sake and listening,” Shion says. “Gamblers will tell you anything at all when they’re losing.”',
    choices: [
      {
        label: '“Did you like it?”',
        tone: 'curious',
        reply: '“I liked being good at it. I’m not sure that’s the same thing.”',
      },
      {
        label: '“You were a spy.”',
        tone: 'earnest',
        reply: '“I was a dealer who listened,” she says. “Spies are the ones who get caught.”',
      },
      {
        label: '“Teach me to listen like that.”',
        tone: 'earnest',
        reply: '“Stop talking, to begin with,” she says, and you laugh.',
      },
    ],
  },
  {
    id: 'shion-informant',
    personId: 'shion',
    minStage: 3,
    opener:
      '“There was a croupier called Kenta who sold me secrets,” Shion says. “I made one mistake, and his boss found out, and it was Kenta who paid for it, not me.”',
    choices: [
      {
        label: '“That wasn’t your fault.”',
        tone: 'kind',
        reply: '“It was. I just happened to survive it.”',
      },
      {
        label: '“What happened to him?”',
        tone: 'curious',
        reply: '“Nobody knows, and that’s the worst of it.”',
      },
      {
        label: 'Say nothing.',
        tone: 'quiet',
        reply: 'She seems grateful you didn’t try to make it better.',
      },
    ],
  },
  {
    id: 'shion-debt',
    personId: 'shion',
    minStage: 4,
    opener:
      '“Kenta’s boss is running the tables in Tanzaku again,” Shion says. “He’s still holding a debt over Kenta, and I owe Kenta. I’d like you there when I collect.”',
    choices: [
      {
        label: '“I’ll watch your back.”',
        tone: 'earnest',
        reply: '“I know you will. That’s why it’s you I asked.”',
        worldMark: SHION_DEBT,
      },
      {
        label: '“Do I get to cheat at cards?”',
        tone: 'joke',
        reply: '“Only if you win,” she says.',
        worldMark: SHION_DEBT,
      },
      {
        label: '“Is this revenge?”',
        tone: 'challenge',
        reply: '“It’s settling up. There’s a difference, I think. Ask me afterwards.”',
        worldMark: SHION_DEBT,
      },
    ],
  },
];
