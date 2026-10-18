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
        reply: '“It’s {art}, so form is most of it,” {them} says without stopping.',
        warm: "{them} finishes the set before {them.they} answer{them.s}, and you can tell {them.they}{them.'s} pleased. “You noticed? Most people only watch my feet.”",
        cool: '“Is it?” {them} doesn’t look round. Praise from a stranger seems to make {them.them} work harder, not softer.',
      },
      {
        label: '“Looks easy enough.”',
        tone: 'challenge',
        reply: '“Then you try it.” {them} steps aside and waits.',
        warm: '“Then you try it,” {them} says, already stepping aside, and looks delighted when you take the bait.',
        cool: '“Does it?” {them} goes back to work as if you had walked on by.',
      },
      {
        label: '“How long do you keep that up?”',
        tone: 'curious',
        reply: '“Until it’s right,” {them} says, and carries on.',
        warm: '“Until it’s right, and then a while longer, in case it was luck.” {them} counts the next one out loud so you can hear how far there is to go.',
        cool: '“Until people stop asking me questions,” {them} says, and carries on.',
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
        reply:
          '“{advice}” {them.they} say{them.s} it the way it was said to {them.them}, word for word.',
        warm: "{them} sits on the fence rail, as if this might take a while and {them.they}{them.'s} glad of it. “{advice}”",
        cool: '“You and everyone else.” {them} sounds unconvinced, but tells you anyway. “{advice}”',
      },
      {
        label: '“Is this going to take long?”',
        tone: 'tease',
        reply: '“Not if you listen.” {them.they} tell{them.s} you anyway. “{advice}”',
        warm: '“It will now you’ve asked.” {them} laughs and makes you hold your stance while {them.they} say{them.s} it. “{advice}”',
        cool: '“Forget I offered, then.” {them} turns away, and only when you call after {them.them} {them.does} {them.they} give it to you, flatly. “{advice}”',
      },
      {
        label: 'Wait for it.',
        tone: 'quiet',
        reply: '{them} takes your silence as a yes. “{advice}”',
        warm: '{them} seems to like that you didn’t fill the gap. {them.they} lower{them.s} {them.their} voice. “{advice}”',
        cool: '“Well? Do you want to hear it or not?” {them} gives up on the pause. “{advice}”',
      },
    ],
  },
  {
    id: 'talk-specialty-1-daily',
    minStage: 1,
    about: 'specialty',
    opener:
      '“People think {art} is about talent,” {them} says. “I think it’s {practice}. Do that long enough and you stop noticing you’re doing it.”',
    choices: [
      {
        label: '“That explains why you’re so good.”',
        tone: 'praise',
        reply: '“It explains why I’m not worse.” {them} goes back to the drill.',
        warm: '{them} tries to wave it off and fails, and stands a little straighter for the rest of the set.',
        cool: '“You don’t know if I’m good. You’ve watched me for a minute.”',
      },
      {
        label: '“Every day? Even festival days?”',
        tone: 'joke',
        reply: '“Especially festival days, when nobody else is training.”',
        warm: '“Especially festival days,” {them} says, laughing. “The ground’s empty and the food stalls are open after.”',
        cool: '“Yes, I train on festival days.” It clearly isn’t funny to {them.them}.',
      },
      {
        label: '“Talent helps, though.”',
        tone: 'challenge',
        reply: '“Then talent can do the drills too.”',
        warm: '“Then talent can do the drills too,” {them} says, and {them.their} eyes light up at the argument. “Go on, tell me who you’re thinking of.”',
        cool: '{them} stops. “That’s what people say when they want a reason not to start.”',
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
        reply: '“The dull part, which is the part that keeps you alive.”',
        warm: '“You really want to know?” {them} talks for a good while about patience and repetition and the hundred small habits that keep a person alive, as if nobody has asked {them.them} in years.',
        cool: '“If you have to ask, you’re one of them.”',
      },
      {
        label: '“Says the one who loves showing off.”',
        tone: 'tease',
        reply: '“I’ve earned my showing off,” {them} says, unbothered.',
        warm: '“I’ve earned my showing off.” {them} laughs and shoves your shoulder. “You’ll get yours one day.”',
        cool: '{them}’s face closes. “I don’t show off,” {them.they} say{them.s}, and watch{them.es} the spar instead of you.',
      },
      {
        label: '“I don’t want to skip anything.”',
        tone: 'earnest',
        reply: '“Good, then you might actually get somewhere.”',
        warm: '{them} looks at you properly for the first time. “Then come by in the morning and I’ll show you the dull part.”',
        cool: '“I said that too, at first.” {them} doesn’t sound as if {them.they} believe{them.s} you.',
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
        label: '“No, you didn’t. Tell me.”',
        tone: 'curious',
        reply: '{pride} {them} looks at {them.their} hands as if they belong to somebody luckier.',
        warm: '{them} pulls you down to sit before {them.they} start{them.s}, and tells it slowly, the way you tell a story you’ve wanted to tell. {pride}',
        cool: '{them} tells it, but quickly, as if you might get bored halfway. {pride}',
      },
      {
        label: '“I bet you were brilliant.”',
        tone: 'praise',
        reply: '“I was lucky.” But {them.they} tell{them.s} you anyway. {pride}',
        warm: '“I was, actually.” {them} doesn’t even pretend to be modest about it. {pride}',
        cool: '“I was lucky, and that’s all it was.” {them} tells it like a report, all the shine taken off. {pride}',
      },
      {
        label: '“Only the once?”',
        tone: 'tease',
        reply: '{them} flicks your forehead. Then {them.they} tell{them.s} you. {pride}',
        warm: '“Once that I’ll tell you about.” {them} flicks your forehead and tells it, laughing. {pride}',
        cool: '“Never mind, then, if you’re going to laugh.” It takes some coaxing before {them} will tell it at all. {pride}',
      },
    ],
  },
  {
    id: 'talk-specialty-2-first',
    minStage: 2,
    about: 'specialty',
    opener:
      '{them} turns a pebble over in {them.their} fingers. “I was hopeless at {art} when I started. Everyone told me to pick something else.”',
    choices: [
      {
        label: '“What made you keep going?”',
        tone: 'curious',
        reply: '“Spite, at first, and then I started to love it.”',
        warm: '“I kept going out of spite.” {them} laughs. “Then one morning it went right, just once, and I’ve been chasing that morning ever since.”',
        cool: '“Does it matter? I kept going.” {them} drops the pebble.',
      },
      {
        label: '“I’m glad you didn’t listen to them.”',
        tone: 'kind',
        reply: '“So am I, most days.”',
        warm: '{them} looks away, pleased. {them.they} turn{them.s} the pebble over a few more times before answering. “So am I.”',
        cool: '“You don’t have to be nice about it. I was hopeless.”',
      },
      {
        label: '“So everyone was wrong about you.”',
        tone: 'joke',
        reply: '“Everyone usually is, in my experience,” {them} says.',
        warm: '“Everyone usually is.” {them} throws the pebble at a fence post and hits it, which pleases {them.them} more than it should.',
        cool: '“They weren’t wrong, I was hopeless. I just didn’t stop.”',
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
        reply: '“You sound very sure.” {them} sounds as if {them.they} want{them.s} to be.',
        warm: '“You sound very sure.” For a moment, listening to you, {them} sounds sure too.',
        cool: '“You don’t know that.” {them} says it quietly, and doesn’t thank you.',
      },
      {
        label: '“What was it like, seeing it?”',
        tone: 'curious',
        reply: '{them} thinks about it. “Like seeing the edge of the world.”',
        warm: '{them} tries three times to describe it and gives up laughing each time, and in the end just shows you with {them.their} hands how fast it was.',
        cool: '“It was fast,” {them} says, and doesn’t try to say more.',
      },
      {
        label: '“Then why aren’t you working on it now?”',
        tone: 'challenge',
        reply: '“Who says I’m not? I work on it every night.”',
        warm: '“Who says I’m not?” {them} is grinning now. “I’m at it every night after the ground empties. Come and see, if you can stay awake.”',
        cool: '“I am. You just don’t see it.” {them} sounds stung.',
      },
    ],
  },
];
