import type { ConversationDef } from '../../../../types';

import { SHION_DEBT } from './marks';

/** Shion’s story, a beat for each stage of closeness (`SenseiWays.story`). */
export const SHION_STORY: readonly ConversationDef[] = [
  {
    id: 'shion-cards',
    personId: 'shion',
    minStage: 1,
    opener:
      'Shion fans a deck of cards at you. “Pick one.” You do. It is blank. “Never trust a deck you didn’t shuffle,” she says.',
    choices: [
      {
        label: '“How did you do that?”',
        tone: 'curious',
        reply: '“I didn’t. You did. You saw what you expected.”',
      },
      {
        label: 'Shuffle her deck yourself.',
        tone: 'challenge',
        reply: 'Every card is now the same queen. She grins.',
      },
      { label: '“That’s cheating.”', tone: 'tease', reply: '“That,” she says, “is the lesson.”' },
    ],
  },
  {
    id: 'shion-tanzaku',
    personId: 'shion',
    minStage: 2,
    opener:
      '“I spent years in Tanzaku Town,” Shion says. “Dealing cards, pouring sake, listening. Gamblers tell you everything when they’re losing.”',
    choices: [
      {
        label: '“Did you like it?”',
        tone: 'curious',
        reply: '“I liked being good at it,” she says. “That isn’t the same.”',
      },
      {
        label: '“You were a spy.”',
        tone: 'earnest',
        reply: '“I was a dealer who listened,” she says. “Spies get caught.”',
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
      '“There was a man who sold me secrets,” Shion says. “Kenta. A croupier. I made one mistake and his boss found out. Kenta paid for it, not me.”',
    choices: [
      {
        label: '“That wasn’t your fault.”',
        tone: 'kind',
        reply: '“It was,” she says. “I just survived it.”',
      },
      {
        label: '“What happened to him?”',
        tone: 'curious',
        reply: '“Nobody knows. That is the worst of it.”',
      },
      { label: 'Say nothing.', tone: 'quiet', reply: 'She seems grateful you didn’t try.' },
    ],
  },
  {
    id: 'shion-debt',
    personId: 'shion',
    minStage: 4,
    opener:
      '“Kenta’s boss is running the tables in Tanzaku again,” Shion says. “He has something of mine. And I owe Kenta. I’d like you there when I collect.”',
    choices: [
      {
        label: '“I’ll watch your back.”',
        tone: 'earnest',
        reply: '“I know,” she says. “That’s why it’s you.”',
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
        reply: '“It’s settling up,” she says. “There’s a difference. I think.”',
        worldMark: SHION_DEBT,
      },
    ],
  },
];
