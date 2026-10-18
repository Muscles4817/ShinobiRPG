import type { ConversationDef } from '../../../types';

/** Talk about someone’s clan, which only friends hear: its elders, its rites and its secrets. */
export const CLAN_TALK: readonly ConversationDef[] = [
  {
    id: 'talk-clan-2-elder',
    minStage: 2,
    about: 'clan',
    opener: '{them} sighs. “Growing up, everything I did was weighed against {elder}.”',
    choices: [
      {
        label: '“Tell me about them.”',
        tone: 'curious',
        reply: '“Stern. Fair, mostly. Even now I hear their voice when I train.”',
      },
      {
        label: '“Did you ever measure up?”',
        tone: 'tease',
        reply: '“Once. Nobody saw.” {them} laughs.',
      },
      {
        label: '“That sounds like a lot to grow up under.”',
        tone: 'kind',
        reply: '{them} looks at you, surprised. “It was. Nobody ever says that.”',
      },
    ],
  },
  {
    id: 'talk-clan-2-rite',
    minStage: 2,
    about: 'clan',
    opener: '“Among {clan}, there’s a custom outsiders rarely see,” {them} says. “It’s {rite}.”',
    choices: [
      {
        label: '“What’s it like, from the inside?”',
        tone: 'curious',
        reply: '“Strange, the first time. Then it’s just home.”',
      },
      {
        label: '“Your family keeps the old ways well.”',
        tone: 'praise',
        reply: '{them} smiles. “I’ll tell them you said so. They’ll be unbearable.”',
      },
      {
        label: '“Is there food involved?”',
        tone: 'joke',
        reply: '“There’s always food involved,” {them} says.',
      },
    ],
  },
  {
    id: 'talk-clan-3-burden',
    minStage: 3,
    about: 'clan',
    opener:
      'Someone mentions {clan}, and {them} goes quiet. Later, {them.they} tell{them.s} you why. {burden}',
    choices: [
      {
        label: '“You’re more than your name.”',
        tone: 'kind',
        reply: '“Tell that to my family.” But {them} looks grateful.',
      },
      {
        label: '“What would you do, if you could choose?”',
        tone: 'earnest',
        reply: '{them} hesitates a long time. “I don’t know. Nobody ever asked.”',
      },
      {
        label: 'Walk beside {them.them} in silence.',
        tone: 'quiet',
        reply: 'By the end of the street, {them} is breathing easier.',
      },
    ],
  },
  {
    id: 'talk-clan-3-duty',
    minStage: 3,
    about: 'clan',
    opener:
      '“Every child of {clan} grows up knowing what’s expected: {duty},” {them} says. “I’m not sure I want it any more.”',
    choices: [
      {
        label: '“Then don’t do it.”',
        tone: 'challenge',
        reply:
          "“It’s not that easy.” But {them} sounds like {them.they}{them.'s} thinking about it.",
      },
      {
        label: '“What would happen if you refused?”',
        tone: 'curious',
        reply: '{them} laughs, without humour. “I’ve never dared find out.”',
      },
      {
        label: '“Whatever you choose, I’ll back you.”',
        tone: 'kind',
        reply: '{them} lets out a long breath. “You might be the only one.”',
      },
    ],
  },
  {
    id: 'talk-clan-4-secret',
    minStage: 4,
    about: 'clan',
    opener:
      '{them} checks that no one is near. “I shouldn’t tell anyone outside the family. But you’re not anyone.”',
    choices: [
      {
        label: '“It stays with me. I swear it.”',
        tone: 'earnest',
        reply: '{them} nods, then leans close. “{secret}”',
      },
      {
        label: 'Listen.',
        tone: 'quiet',
        reply: '“{secret}” {them} watches you take it in.',
      },
      {
        label: '“Is it a recipe?”',
        tone: 'tease',
        reply: '{them} almost laughs. Then, very quietly: “{secret}”',
      },
    ],
  },
  {
    id: 'talk-clan-4-family',
    minStage: 4,
    about: 'clan',
    opener: '{them} looks oddly shy. “I talked about you at home. To {elder}.”',
    choices: [
      {
        label: '“What did they say?”',
        tone: 'curious',
        reply: '“That you sound like family.” {them} looks at the ground. “I agree.”',
      },
      {
        label: '“Did I pass?”',
        tone: 'joke',
        reply: '“Barely,” {them} says, grinning. “You’re invited to dinner. Be afraid.”',
      },
      {
        label: '“I’m honoured.”',
        tone: 'earnest',
        reply: '“You should be. They don’t ask after many people.”',
      },
    ],
  },
];
