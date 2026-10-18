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
        reply: '“In {art}, you sort of do.” But {them.their} shoulders come down a little.',
        warm: '“In {art}, you sort of do.” {them} leans {them.their} head back against the post, and some of the tightness goes out of {them.their} face.',
        cool: '“Easy to say when it isn’t yours.” {them} picks at the grass and won’t look up.',
      },
      {
        label: '“Then we’ll work on it together.”',
        tone: 'earnest',
        reply: '“You mean that,” {them} says, as if checking.',
        warm: '{them} looks at you for a while before answering. “You mean that.” It isn’t a question, and {them.they} get{them.s} up off the ground.',
        cool: '“You’ve got your own work.” {them} doesn’t want to be anyone’s project, and says so.',
      },
      {
        label: 'Sit down beside {them.them}.',
        tone: 'quiet',
        reply: 'Neither of you says anything. After a while {them} lets out a long breath.',
        warm: 'You sit until the shadow of the post has moved a hand’s width, and when {them} finally gets up {them.they} offer{them.s} you a hand too.',
        cool: '{them} puts up with it for a minute, then asks whether you came here to stare at the grass.',
      },
    ],
  },
  {
    id: 'talk-specialty-3-cost',
    minStage: 3,
    about: 'specialty',
    opener:
      '{them} flexes {them.their} hands and winces. “Nobody tells you what {art} costs. Your body keeps count.”',
    choices: [
      {
        label: '“Does it hurt all the time?”',
        tone: 'curious',
        reply: '“Not all the time, I promise.” Which, you notice, is not the same as no.',
        warm: '“Not all the time.” Then, because you asked properly, {them.they} tell{them.s} you where. Two knuckles, a wrist that clicks in the cold, a knee {them.they} favour{them.s} on stairs.',
        cool: '“I’m fine.” {them} puts {them.their} hands in {them.their} sleeves where you can’t see them.',
      },
      {
        label: '“Then rest, before you break your hands.”',
        tone: 'challenge',
        reply: '{them} bristles, then lets it go. “You’re right. I hate that you’re right.”',
        warm: '“You’re right.” {them} laughs at {them.themself}. “I hate that you’re right. One day off, and you can tell me I listened.”',
        cool: '“And do what, sit at home and watch everyone pass me?” {them} gets up and goes back to the post.',
      },
      {
        label: 'Fetch {them.them} a cup of tea.',
        tone: 'kind',
        reply: '{them} holds the cup long after it has gone cold.',
        warm: '{them} holds the cup in both hands for the warmth and talks to you over it until it’s gone cold, about nothing much.',
        cool: '“I’m not ill.” But {them} takes the cup, and drinks it.',
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
        label: '“You’d still be you, and that’s enough.”',
        tone: 'earnest',
        reply: '“That’s an unfair thing to say to me. Thank you.”',
        warm: '{them} laughs, a little unsteady. “That’s an unfair thing to say to me. Thank you.”',
        cool: '“You don’t know who I’d be.” {them} isn’t angry, only unconvinced.',
      },
      {
        label: 'Let the words sit.',
        tone: 'quiet',
        reply: 'The wind moves the grass. {them} doesn’t seem to want an answer.',
        warm: "The wind moves the grass. {them} seems glad you didn’t rush to fix it, and after a while goes on, more easily, about what {them.they}{them.'s} afraid of.",
        cool: '“Say something, then,” {them} says. “Say anything you like.”',
      },
      {
        label: '“Scared? You?”',
        tone: 'tease',
        reply: '“Don’t you start.” But the moment passes, which may have been the point.',
        warm: '“Don’t you start.” {them} is laughing, though. The heaviness goes out of it.',
        cool: '“I knew I shouldn’t have said anything.” {them} doesn’t say any more.',
      },
    ],
  },
  {
    id: 'talk-specialty-4-keepsake',
    minStage: 4,
    about: 'specialty',
    opener:
      '{them} presses it into your hand, {keepsake}. “It’s been with me since my first day of {art}. I want you to have it.”',
    choices: [
      {
        label: '“I’ll look after it.”',
        tone: 'kind',
        reply: '“I know you will. That’s why I’m giving it to you.”',
        warm: '“I know you will.” {them} closes your hand round it. “That’s why it’s yours and not anyone else’s.”',
        cool: '“I didn’t give it you to put on a shelf.” {them} sounds almost cross that you’d keep it like glass.',
      },
      {
        label: '“I can’t take this.”',
        tone: 'earnest',
        reply: '“You can, and you will.” {them} closes your fingers over it.',
        warm: '“You can, and you will.” {them} closes your fingers over it and holds them shut until you stop arguing.',
        cool: '“Have it your way.” {them} takes it back, then thinks better of it and puts it in your pocket instead.',
      },
      {
        label: 'Hold it a while, then thank {them.them}.',
        tone: 'quiet',
        reply: '“Now you have it,” {them} says.',
        warm: '{them} watches you turn it over in your hands, and is happier with that than with any thanks you could have made up.',
        cool: '“You could say whether you like it,” {them} says.',
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
        warm: '{them} holds out a hand, and you shake on it like academy students, solemn as anything, and then both of you laugh.',
        cool: '“Don’t say it like it’s a chore.”',
      },
      {
        label: '“I’ll be in the front row with snacks.”',
        tone: 'joke',
        reply: '“Bring enough for me too.”',
        warm: '{them} laughs. “Bring enough for me too. I’ll be starving after.”',
        cool: '“I’m serious.” {them} waits until you are too.',
      },
      {
        label: '“Only if you watch me do the same.”',
        tone: 'challenge',
        reply: '“Deal, and whoever gets there last buys dinner.”',
        warm: '“You’re on.” {them} spits in {them.their} palm before you can stop {them.them}. “Whoever gets there last buys dinner for a month.”',
        cool: '“It isn’t a race, you know.” But {them} shakes on it anyway.',
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
        label: '“Then teach me all of it.”',
        tone: 'earnest',
        reply: '{them} says it slowly, so you’ll keep it. “{advice}”',
        warm: '“All of it? Then we’d better start.” {them} takes you straight back through the gate to the ground, as if there’s no time to lose. “{advice}”',
        cool: '{them} won’t promise all of it, but gives you one thing to start with. “{advice}”',
      },
      {
        label: '“You’re coming back, every time.”',
        tone: 'kind',
        reply: '{them} squeezes your arm. “Then we’ll have more time for lessons.”',
        warm: '{them} squeezes your arm hard, and for a moment doesn’t trust {them.their} voice. “Then we’ll have more time for lessons.”',
        cool: '“You can’t promise that for me,” {them} says. “That’s why I’m asking.”',
      },
      {
        label: '“Fine, but I’m doing it my way.”',
        tone: 'tease',
        reply: '“Of course you are.” {them} looks oddly proud.',
        warm: '“Of course you are. That’s why I picked you.” {them} looks oddly proud.',
        cool: '“Then it won’t be mine, will it?” {them} lets the gate swing shut between you.',
      },
    ],
  },
];
