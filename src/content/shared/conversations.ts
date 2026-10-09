import type { ConversationDef } from '../types';

/**
 * Small talk anyone can have. Each reply has a tone; the listener's traits decide whether
 * it lands. Authored characters add their own conversations in their pack.
 */
export const GENERIC_CONVERSATIONS: readonly ConversationDef[] = [
  {
    id: 'generic-training',
    minStage: 0,
    opener: '{them} wipes sweat from their brow. "Been training since dawn. You?"',
    choices: [
      {
        label: '“Bet I could outlast you.”',
        tone: 'challenge',
        reply: '{them} grins. "Is that so?"',
      },
      {
        label: '“You look exhausted. Take a break.”',
        tone: 'kind',
        reply: '{them} hesitates, then sits down beside you.',
      },
      {
        label: '“What were you working on?”',
        tone: 'curious',
        reply: '{them} explains, at length, with hand gestures.',
      },
    ],
  },
  {
    id: 'generic-food',
    minStage: 0,
    opener: '"I could eat a whole pot of rice right now," {them} says.',
    choices: [
      {
        label: '“Only one pot?”',
        tone: 'joke',
        reply: '{them} laughs harder than the joke deserves.',
      },
      {
        label: '“I know a good stall. My treat sometime.”',
        tone: 'kind',
        reply: '"I’ll hold you to that," {them} says.',
      },
      {
        label: 'Nod and say nothing.',
        tone: 'quiet',
        reply: 'You stand in comfortable silence for a while.',
      },
    ],
  },
  {
    id: 'generic-weather',
    minStage: 0,
    opener: '{them} squints at the sky. "Rain later, I think."',
    choices: [
      {
        label: '“Good. Training in the rain builds character.”',
        tone: 'earnest',
        reply: '{them} gives you a long look. "You really believe that."',
      },
      {
        label: '“You sound like an old fisherman.”',
        tone: 'tease',
        reply: '"An old fisherman who is usually right," {them} says.',
      },
      {
        label: '“How can you tell?”',
        tone: 'curious',
        reply: '{them} points out the clouds, the birds, the smell of the air.',
      },
    ],
  },
  {
    id: 'generic-mission',
    minStage: 1,
    opener: '"Heard you took a job from the mission desk," {them} says. "How did it go?"',
    choices: [
      {
        label: '“Easy. Next time I want something real.”',
        tone: 'challenge',
        reply: '"Careful what you wish for," {them} says.',
      },
      {
        label: '“Honestly? I learned a lot.”',
        tone: 'earnest',
        reply: '{them} nods slowly. "That’s the right answer."',
      },
      {
        label: '“I chased a cat for two hours.”',
        tone: 'joke',
        reply: '{them} has to sit down from laughing.',
      },
    ],
  },
  {
    id: 'generic-skill',
    minStage: 1,
    opener: '{them} shows you a technique they have been practising. It is good.',
    choices: [
      {
        label: '“That was incredible.”',
        tone: 'praise',
        reply: '{them} tries not to look pleased, and fails.',
      },
      {
        label: '“Your left foot is late.”',
        tone: 'tease',
        reply: '{them} glares, then tries again. The left foot is on time.',
      },
      {
        label: '“Teach me?”',
        tone: 'curious',
        reply: '"Maybe," {them} says, "if you can keep up."',
      },
    ],
  },
  {
    id: 'generic-dream',
    minStage: 2,
    opener:
      '"Can I tell you something?" {them} says. "I want to be more than a genin who catches cats."',
    choices: [
      {
        label: '“You will be. I’ve seen you train.”',
        tone: 'kind',
        reply: '{them} looks away, but you catch the smile.',
      },
      {
        label: '“Then race me there.”',
        tone: 'challenge',
        reply: '"You’re on," {them} says, and means it.',
      },
      {
        label: 'Listen, and let them talk.',
        tone: 'quiet',
        reply: '{them} talks for a long time. You don’t interrupt once.',
      },
    ],
  },
  {
    id: 'generic-worry',
    minStage: 2,
    opener: '{them} is quieter than usual today. Something is on their mind.',
    choices: [
      {
        label: '“Whatever it is, I’ve got your back.”',
        tone: 'earnest',
        reply: '"I know," {them} says. "That’s why I came to find you."',
      },
      {
        label: '“Want to go get noodles and not talk about it?”',
        tone: 'kind',
        reply: '{them} laughs for the first time today. "Yes."',
      },
      {
        label: '“Spit it out.”',
        tone: 'challenge',
        reply: '{them} flinches, then tells you anyway.',
      },
    ],
  },
  {
    id: 'generic-praise',
    minStage: 3,
    opener: '"You’ve changed since the Academy," {them} says. "In a good way."',
    choices: [
      {
        label: '“So have you. I’m glad we’re friends.”',
        tone: 'kind',
        reply: '{them} bumps your shoulder with theirs.',
      },
      {
        label: '“I’m still going to beat you, though.”',
        tone: 'challenge',
        reply: '"Wouldn’t want it any other way," {them} says.',
      },
      {
        label: '“Took you long enough to notice.”',
        tone: 'tease',
        reply: '{them} throws a pebble at you. It is affectionate.',
      },
    ],
  },
];
