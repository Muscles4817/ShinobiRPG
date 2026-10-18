import type { ConversationDef } from '../../../types';

/** Talk about someone’s art between friends: what they are proud of, how they began, what they want. */
export const SPECIALTY_FRIENDS_TALK: readonly ConversationDef[] = [
  {
    id: 'talk-specialty-2-pride',
    minStage: 2,
    about: 'specialty',
    opener: {
      blunt: '“I ever tell you about the best thing I’ve done with {art}?” {them} asks.',
      warm: '“Did I ever tell you about the time {art} really worked for me?” {them} asks, already smiling at the memory.',
      wry: '“Do you want to hear about the one time {art} went exactly the way it does in stories?” {them} asks. “It was only the once, so it’s a short story.”',
      formal:
        '“I don’t believe I have told you about my proudest moment in {art},” {them} says, and waits to see if you would like to hear it.',
    },
    choices: [
      {
        label: '“No, you didn’t. Tell me.”',
        tone: 'curious',
        reply: {
          blunt:
            '{pride} {them} looks at {them.their} hands as if they belong to somebody luckier.',
          warm: '{pride} {them} shakes {them.their} head at it, as if it happened to somebody else.',
        },
        warm: '{them} pulls you down to sit before {them.they} start{them.s}, and tells it slowly, the way you tell a story you’ve wanted to tell. {pride}',
        cool: '{them} tells it, but quickly, as if you might get bored halfway. {pride}',
      },
      {
        label: '“I bet you were brilliant.”',
        tone: 'praise',
        reply: {
          blunt: '“I was lucky.” But {them.they} tell{them.s} you anyway. {pride}',
          warm: '“Lucky, more like.” But {them.they} tell{them.s} you anyway, and {them.does}n’t hide being pleased. {pride}',
        },
        warm: '“I was, actually.” {them} doesn’t even pretend to be modest about it. {pride}',
        cool: '“I was lucky, and that’s all it was.” {them} tells it like a report, all the shine taken off. {pride}',
      },
      {
        label: '“Only the once?”',
        tone: 'tease',
        reply: {
          blunt: '{them} flicks your forehead. Then {them.they} tell{them.s} you. {pride}',
          warm: '“Once is plenty, thank you.” Then {them.they} tell{them.s} you. {pride}',
        },
        warm: '“Once that I’ll tell you about.” {them} flicks your forehead and tells it, laughing. {pride}',
        cool: '“Never mind, then, if you’re going to laugh.” It takes some coaxing before {them} will tell it at all. {pride}',
      },
    ],
  },
  {
    id: 'talk-specialty-2-first',
    minStage: 2,
    about: 'specialty',
    opener: {
      blunt:
        '{them} kicks a pebble along the path. “I was hopeless at {art} when I started. Everyone told me to quit.”',
      warm: '{them} turns a pebble over in {them.their} fingers. “You wouldn’t believe it, but I was hopeless at {art} when I started. Everyone told me to pick something else.”',
      wry: '{them} turns a pebble over in {them.their} fingers. “When I started {art}, the instructors held a meeting about me. The meeting decided I should try anything else.”',
      formal:
        '{them} turns a pebble over in {them.their} fingers. “When I began {art}, I showed no aptitude at all. I was advised, more than once, to choose another art.”',
    },
    choices: [
      {
        label: '“What made you keep going?”',
        tone: 'curious',
        reply: {
          blunt: '“Spite, at first, and then I started to love it.”',
          warm: '“I think it was stubbornness at first, and then somewhere along the way I fell in love with it.”',
        },
        warm: '“I kept going out of spite.” {them} laughs. “Then one morning it went right, just once, and I’ve been chasing that morning ever since.”',
        cool: '“Does it matter? I kept going.” {them} drops the pebble.',
      },
      {
        label: '“I’m glad you didn’t listen to them.”',
        tone: 'kind',
        reply: {
          blunt: '“So am I, most days.”',
          warm: '“So am I, most days. Thank you for saying it.”',
        },
        warm: '{them} looks away, pleased. {them.they} turn{them.s} the pebble over a few more times before answering. “So am I.”',
        cool: '“You don’t have to be nice about it. I was hopeless.”',
      },
      {
        label: '“So everyone was wrong about you.”',
        tone: 'joke',
        reply: {
          blunt: '“Everyone usually is, in my experience,” {them} says.',
          warm: '“Everyone was wrong, and I’ve been unbearable about it ever since,” {them} says.',
        },
        warm: '“Everyone usually is.” {them} throws the pebble at a fence post and hits it, which pleases {them.them} more than it should.',
        cool: '“They weren’t wrong, I was hopeless. I just didn’t stop.”',
      },
    ],
  },
  {
    id: 'talk-specialty-2-dream',
    minStage: 2,
    about: 'specialty',
    opener: {
      blunt:
        '“A shinobi came to the academy once and showed us {dream},” {them} says. “I’m going to do that. I’ve known it since that day.”',
      warm: '“A shinobi came to the academy once,” {them} says. “They showed us {dream}. I’ve wanted it ever since, more than I can tell you.”',
      wry: '“A shinobi came to the academy once and showed us {dream},” {them} says. “The rest of the class went home and forgot about it. I’m still not over it.”',
      formal:
        '“When I was at the academy, a visiting shinobi demonstrated {dream},” {them} says. “I have been working towards it since that afternoon.”',
    },
    choices: [
      {
        label: '“You’ll get there.”',
        tone: 'earnest',
        reply: {
          blunt: '“You sound very sure.” {them} sounds as if {them.they} want{them.s} to be.',
          warm: '“You sound very sure. I wish I were.”',
        },
        warm: '“You sound very sure.” For a moment, listening to you, {them} sounds sure too.',
        cool: '“You don’t know that.” {them} says it quietly, and doesn’t thank you.',
      },
      {
        label: '“What was it like, seeing it?”',
        tone: 'curious',
        reply: {
          blunt: '{them} thinks about it. “Like seeing the edge of the world.”',
          warm: '{them} thinks about it for a while. “Like being shown the edge of the world and told you could walk there.”',
        },
        warm: '{them} tries three times to describe it and gives up laughing each time, and in the end just shows you with {them.their} hands how fast it was.',
        cool: '“It was fast,” {them} says, and doesn’t try to say more.',
      },
      {
        label: '“Then why aren’t you working on it now?”',
        tone: 'challenge',
        reply: {
          blunt: '“Who says I’m not? I work on it every night.”',
          warm: '“I am, you know. Every night, when the ground is quiet.”',
        },
        warm: '“Who says I’m not?” {them} is grinning now. “I’m at it every night after the ground empties. Come and see, if you can stay awake.”',
        cool: '“I am. You just don’t see it.” {them} sounds stung.',
      },
    ],
  },
];
