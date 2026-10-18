import type { ConversationDef } from '../../../types';

/** Talk about someone’s art between close friends: what it costs them, and what they’d give. */
export const SPECIALTY_DEEP_TALK: readonly ConversationDef[] = [
  {
    id: 'talk-specialty-3-doubt',
    minStage: 3,
    about: 'specialty',
    opener: 'You find {them} sitting by the training post, not training. {doubt}',
    choices: [
      {
        label: '“You don’t have to get everything right.”',
        tone: 'kind',
        reply: '“In {art}, you sort of do.” But {them.their} shoulders ease a little.',
      },
      {
        label: '“Then we’ll work on it together.”',
        tone: 'earnest',
        reply: '{them} looks at you for a long moment. “You mean that.” It isn’t a question.',
      },
      {
        label: 'Sit down beside {them.them}.',
        tone: 'quiet',
        reply: 'Neither of you says anything. After a while, {them} lets out a long breath.',
      },
    ],
  },
  {
    id: 'talk-specialty-3-cost',
    minStage: 3,
    about: 'specialty',
    opener:
      '{them} flexes {them.their} hands and winces. “Nobody tells you what {art} costs. The body keeps count.”',
    choices: [
      {
        label: '“Does it hurt all the time?”',
        tone: 'curious',
        reply: '“Not all the time.” Which, you notice, is not the same as no.',
      },
      {
        label: '“Then rest, before you break something.”',
        tone: 'challenge',
        reply: '{them} bristles, then sighs. “You’re right. I hate that you’re right.”',
      },
      {
        label: 'Fetch {them.them} something warm to drink.',
        tone: 'kind',
        reply: '{them} holds the cup long after it has gone cold.',
      },
    ],
  },
  {
    id: 'talk-specialty-3-dream',
    minStage: 3,
    about: 'specialty',
    opener:
      '“Sometimes I think I chase {dream} because I’m scared of who I’d be without it,” {them} says.',
    choices: [
      {
        label: '“You’d still be you. That’s enough.”',
        tone: 'earnest',
        reply: '{them} laughs, a little unsteady. “That’s an unfair thing to say. Thank you.”',
      },
      {
        label: 'Let the words sit.',
        tone: 'quiet',
        reply: 'The wind moves the grass. {them} seems glad you didn’t rush to fix it.',
      },
      {
        label: '“Scared? You?”',
        tone: 'tease',
        reply: '“Don’t.” But {them} is almost smiling, and the moment passes.',
      },
    ],
  },
  {
    id: 'talk-specialty-4-keepsake',
    minStage: 4,
    about: 'specialty',
    opener:
      '{them} presses something into your hand: {keepsake}. “It’s been with me since my first day of {art}. I want you to have it.”',
    choices: [
      {
        label: '“I’ll look after it.”',
        tone: 'kind',
        reply: '“I know you will. That’s why it’s yours.”',
      },
      {
        label: '“I can’t take this.”',
        tone: 'earnest',
        reply: '“You can, and you will.” {them} closes your fingers over it.',
      },
      {
        label: 'Hold it a while, then nod.',
        tone: 'quiet',
        reply: '{them} nods back. Some things don’t need saying.',
      },
    ],
  },
  {
    id: 'talk-specialty-4-promise',
    minStage: 4,
    about: 'specialty',
    opener:
      '“When I finally master {dream},” {them} says, “you’ll be the first to see it. Promise you’ll be there.”',
    choices: [
      {
        label: '“I promise.”',
        tone: 'earnest',
        reply: '{them} holds out a hand, and you shake on it like academy students.',
      },
      {
        label: '“Front row. I’ll bring snacks.”',
        tone: 'joke',
        reply: '{them} laughs. “Bring enough for two.”',
      },
      {
        label: '“Only if you watch me do the same.”',
        tone: 'challenge',
        reply: '“Deal. And whoever gets there last buys dinner.”',
      },
    ],
  },
  {
    id: 'talk-specialty-4-lesson',
    minStage: 4,
    about: 'specialty',
    opener:
      '{them} stops you at the gate. “If I ever don’t come back, I want someone to carry my {art} on. I want it to be you.”',
    choices: [
      {
        label: '“Then teach me. All of it.”',
        tone: 'earnest',
        reply: '“It all starts here.” {them} says it slowly, so you’ll keep it. “{advice}”',
      },
      {
        label: '“You’re coming back. Every time.”',
        tone: 'kind',
        reply: '{them} squeezes your arm. “Then we’ll have more time for lessons.”',
      },
      {
        label: '“Fine, but I’m doing it my way.”',
        tone: 'tease',
        reply: '“Of course you are.” {them} looks oddly proud.',
      },
    ],
  },
];
