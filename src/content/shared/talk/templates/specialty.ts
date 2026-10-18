import type { ConversationDef } from '../../../types';

/** Talk about someone’s art, from first meetings to friendship. */
export const SPECIALTY_TALK: readonly ConversationDef[] = [
  {
    id: 'talk-specialty-0-watch',
    minStage: 0,
    about: 'specialty',
    opener:
      'You find {them} hard at work: {practice}. {them.they} keep{them.s} going when you walk up.',
    choices: [
      {
        label: '“That’s good form.”',
        tone: 'praise',
        reply: '{them} almost smiles. “It’s {art}. Form is the whole thing.”',
      },
      {
        label: '“Looks easy enough.”',
        tone: 'challenge',
        reply: '“Then try it.” {them} steps aside and waits.',
      },
      {
        label: '“How long do you keep that up?”',
        tone: 'curious',
        reply: '“Until it’s right,” {them} says, and carries on.',
      },
    ],
  },
  {
    id: 'talk-specialty-1-advice',
    minStage: 1,
    about: 'specialty',
    opener: '{them} watches you train, then can’t help it. “Can I tell you something about {art}?”',
    choices: [
      {
        label: '“Please. I want to get better.”',
        tone: 'earnest',
        reply: '“{advice}” {them.they} say{them.s} it like something handed down.',
      },
      {
        label: '“Is this going to take long?”',
        tone: 'tease',
        reply: '“Not if you listen.” {them.they} tell{them.s} you anyway. “{advice}”',
      },
      {
        label: 'Nod and wait.',
        tone: 'quiet',
        reply: '{them} seems to like that. “{advice}”',
      },
    ],
  },
  {
    id: 'talk-specialty-1-daily',
    minStage: 1,
    about: 'specialty',
    opener:
      '“People think {art} is about talent,” {them} says. “It isn’t. It’s {practice}, every day.”',
    choices: [
      {
        label: '“That explains why you’re so good.”',
        tone: 'praise',
        reply: '{them} shrugs, but stands a little straighter.',
      },
      {
        label: '“Every day? Even festival days?”',
        tone: 'joke',
        reply: '“Especially festival days. Nobody else is training.”',
      },
      {
        label: '“Talent helps, though.”',
        tone: 'challenge',
        reply:
          '“Then talent can do the drills too.” {them.their} face doesn’t smile, but {them.their} eyes do.',
      },
    ],
  },
  {
    id: 'talk-specialty-1-opinion',
    minStage: 1,
    about: 'specialty',
    opener:
      '{them} frowns at two genin sparring nearby. “Most people who try {art} want the flashy part and skip the rest.”',
    choices: [
      {
        label: '“What’s the rest?”',
        tone: 'curious',
        reply: '“The dull part. Which is the part that keeps you alive.”',
      },
      {
        label: '“Says the one who loves showing off.”',
        tone: 'tease',
        reply: '“I’ve earned my showing off,” {them} says, unbothered.',
      },
      {
        label: '“I don’t want to skip anything.”',
        tone: 'earnest',
        reply: '{them} studies you. “Good. Then you might actually get somewhere.”',
      },
    ],
  },
  {
    id: 'talk-specialty-2-pride',
    minStage: 2,
    about: 'specialty',
    opener:
      '“Did I ever tell you about the time {art} really worked for me?” {them} asks, already smiling.',
    choices: [
      {
        label: '“No. Tell me.”',
        tone: 'curious',
        reply:
          '{pride} {them} looks at {them.their} hands as if {them.they} still can’t quite believe it.',
      },
      {
        label: '“I bet you were brilliant.”',
        tone: 'praise',
        reply: '“I was lucky.” But {them.they} tell{them.s} you anyway. {pride}',
      },
      {
        label: '“Only the once?”',
        tone: 'tease',
        reply:
          '{them} flicks your forehead. Then, more softly, {them.they} tell{them.s} you. {pride}',
      },
    ],
  },
  {
    id: 'talk-specialty-2-first',
    minStage: 2,
    about: 'specialty',
    opener:
      '{them} turns a pebble over in {them.their} fingers. “I was hopeless at {art} when I started. Everyone said to pick something else.”',
    choices: [
      {
        label: '“What made you keep going?”',
        tone: 'curious',
        reply: '“Spite, at first. Then I started to love it.”',
      },
      {
        label: '“I’m glad you didn’t listen to them.”',
        tone: 'kind',
        reply: '{them} looks away, pleased. “So am I.”',
      },
      {
        label: '“So everyone was wrong.”',
        tone: 'joke',
        reply: '“Everyone usually is,” {them} says, grinning.',
      },
    ],
  },
  {
    id: 'talk-specialty-2-dream',
    minStage: 2,
    about: 'specialty',
    opener:
      '“A shinobi came to the academy once,” {them} says. “They showed us {dream}. I’ve wanted it ever since.”',
    choices: [
      {
        label: '“You’ll get there.”',
        tone: 'earnest',
        reply: '“You sound very sure.” {them} sounds like {them.they} want{them.s} to be.',
      },
      {
        label: '“What was it like, seeing it?”',
        tone: 'curious',
        reply: '{them} is quiet a moment. “Like seeing the edge of the world.”',
      },
      {
        label: '“Then why aren’t you working on it now?”',
        tone: 'challenge',
        reply: '“Who says I’m not?” {them} grins. “Every night.”',
      },
    ],
  },
];
