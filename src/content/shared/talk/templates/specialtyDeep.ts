import type { ConversationDef } from '../../../types';

/** Talk about someone’s art between close friends: what it costs them, and what they’d give. */
export const SPECIALTY_DEEP_TALK: readonly ConversationDef[] = [
  {
    id: 'talk-specialty-3-doubt',
    minStage: 3,
    about: 'specialty',
    opener: {
      blunt:
        '{them} is sitting by the training post with {them.their} arms on {them.their} knees, not training. When you ask, {them.they} tell{them.s} you straight. {doubt}',
      warm: 'You find {them} sitting by the training post, not training, and sit down too. It takes {them.them} a while to say it. {doubt}',
      wry: '{them} is sitting by the training post, glaring at it as if it started the argument. “Don’t mind me. I’m having a crisis.” {doubt}',
      formal:
        'You find {them} sitting by the training post, very still, not training. {them.they} answer{them.s} your question carefully, as if testing each word. {doubt}',
    },
    choices: [
      {
        label: '“You don’t have to get everything right.”',
        tone: 'kind',
        reply: {
          blunt: '“In {art}, you sort of do.” But {them.their} shoulders come down a little.',
          warm: '“In {art}, I think you do.” But {them} lets the breath go, and {them.their} shoulders come down a little.',
        },
        warm: '“In {art}, you sort of do.” {them} leans {them.their} head back against the post, and some of the tightness goes out of {them.their} face.',
        cool: '“Easy to say when it isn’t yours.” {them} picks at the grass and won’t look up.',
      },
      {
        label: '“Then we’ll work on it together.”',
        tone: 'earnest',
        reply: {
          blunt: '“You mean that,” {them} says, as if checking.',
          warm: '“Do you mean that?” {them} looks at you as if checking, and seems to find that you do.',
        },
        warm: '{them} looks at you for a while before answering. “You mean that.” It isn’t a question, and {them.they} get{them.s} up off the ground.',
        cool: '“You’ve got your own work.” {them} doesn’t want to be anyone’s project, and says so.',
      },
      {
        label: 'Sit down beside {them.them}.',
        tone: 'quiet',
        reply: {
          blunt: 'Neither of you says anything. After a while {them} lets out a long breath.',
          warm: 'Neither of you says anything for a while, and then {them} lets out a long breath and leans against your shoulder.',
        },
        warm: 'You sit until the shadow of the post has moved a hand’s width, and when {them} finally gets up {them.they} offer{them.s} you a hand too.',
        cool: '{them} puts up with it for a minute, then asks whether you came here to stare at the grass.',
      },
    ],
  },
  {
    id: 'talk-specialty-3-cost',
    minStage: 3,
    about: 'specialty',
    opener: {
      blunt:
        '{them} flexes {them.their} hands and winces. “Nobody tells you what {art} costs. Your body keeps count.”',
      warm: '{them} rubs {them.their} wrists when {them.they} think{them.s} you aren’t looking. “Nobody warns you what {art} takes out of you. The body remembers every year of it.”',
      wry: '{them} flexes {them.their} hands, and a knuckle clicks like a twig. “I love {art}, but it bills you for it, and the body keeps the receipts.”',
      formal:
        '{them} flexes {them.their} hands with some care. “There is a price to {art} that no one mentions at the academy. The body keeps an exact account.”',
    },
    choices: [
      {
        label: '“Does it hurt all the time?”',
        tone: 'curious',
        reply: {
          blunt: '“Not all the time, I promise.” Which, you notice, is not the same as no.',
          warm: '“Not all the time, and not so you’d notice.” Which, you notice, is not the same as no.',
        },
        warm: '“Not all the time.” Then, because you asked properly, {them.they} tell{them.s} you where. Two knuckles, a wrist that clicks in the cold, a knee {them.they} favour{them.s} on stairs.',
        cool: '“I’m fine.” {them} puts {them.their} hands in {them.their} sleeves where you can’t see them.',
      },
      {
        label: '“Then rest, before you break your hands.”',
        tone: 'challenge',
        reply: {
          blunt: '{them} bristles, then lets it go. “You’re right. I hate that you’re right.”',
          warm: '{them} starts to argue, then lets it go. “You’re right. I don’t like it, but you’re right.”',
        },
        warm: '“You’re right.” {them} laughs at {them.themself}. “I hate that you’re right. One day off, and you can tell me I listened.”',
        cool: '“And do what, sit at home and watch everyone pass me?” {them} gets up and goes back to the post.',
      },
      {
        label: 'Fetch {them.them} a cup of tea.',
        tone: 'kind',
        reply: {
          blunt: '{them} holds the cup long after it has gone cold.',
          warm: '{them} thanks you and holds the cup in both hands, long after it has gone cold.',
        },
        warm: '{them} holds the cup in both hands for the warmth and talks to you over it until it’s gone cold, about nothing much.',
        cool: '“I’m not ill.” But {them} takes the cup, and drinks it.',
      },
    ],
  },
  {
    id: 'talk-specialty-3-dream',
    minStage: 3,
    about: 'specialty',
    opener: {
      blunt:
        '“I think I chase {dream} because I’m scared of who I’d be without it,” {them} says, out of nowhere.',
      warm: '“Can I tell you a strange thing?” {them} says. “Sometimes I think I chase {dream} because I’m scared of who I’d be without it.”',
      wry: '“Here’s a cheerful thought,” {them} says. “What if I only chase {dream} because without it I’d be a person with a lot of free evenings and no idea what to do with them?”',
      formal:
        '“I have begun to suspect,” {them} says, “that I pursue {dream} partly out of fear of who I would be without it.”',
    },
    choices: [
      {
        label: '“You’d still be you, and that’s enough.”',
        tone: 'earnest',
        reply: {
          blunt: '“That’s an unfair thing to say to me, and thank you.”',
          warm: '“That’s a kind thing to say, and I’m going to pretend I believe it, so thank you.”',
        },
        warm: '{them} laughs, a little unsteady. “That’s an unfair thing to say to me, and thank you.”',
        cool: '“You don’t know who I’d be.” {them} isn’t angry, only unconvinced.',
      },
      {
        label: 'Let the words sit.',
        tone: 'quiet',
        reply: {
          blunt: 'The wind moves the grass. {them} doesn’t seem to want an answer.',
          warm: 'The wind moves the grass. {them} doesn’t seem to need an answer, only someone to have heard it.',
        },
        warm: "The wind moves the grass. {them} seems glad you didn’t rush to fix it, and after a while goes on, more easily, about what {them.they}{them.'s} afraid of.",
        cool: '“Say something, then,” {them} says. “Say anything you like.”',
      },
      {
        label: '“Scared? You?”',
        tone: 'tease',
        reply: {
          blunt: '“Don’t you start.” But the moment passes, which may have been the point.',
          warm: '“Yes, me. Don’t look so surprised.” But the moment passes, which may have been the point.',
        },
        warm: '“Don’t you start.” {them} is laughing, though. The heaviness goes out of it.',
        cool: '“I knew I shouldn’t have said anything.” {them} doesn’t say any more.',
      },
    ],
  },
  {
    id: 'talk-specialty-4-keepsake',
    minStage: 4,
    about: 'specialty',
    opener: {
      blunt:
        '{them} pushes it into your hand without ceremony, {keepsake}. “Had it since my first day of {art}. It’s yours now.”',
      warm: '{them} presses it into your hand, {keepsake}. “It’s been with me since my first day of {art}. I want you to have it, more than anyone.”',
      wry: '{them} drops it into your palm, {keepsake}. “Since my first day of {art}. Don’t sell it. Or do, but tell me what you got.”',
      formal:
        '{them} offers it in both hands, {keepsake}. “This has been with me since my first day of {art}. I would like you to keep it.”',
    },
    choices: [
      {
        label: '“I’ll look after it.”',
        tone: 'kind',
        reply: {
          blunt: '“I know you will. That’s why I’m giving it to you.”',
          warm: '“I know you will. That’s why I wanted it to be you.”',
        },
        warm: '“I know you will.” {them} closes your hand round it. “That’s why it’s yours and not anyone else’s.”',
        cool: '“I didn’t give it you to put on a shelf.” {them} sounds almost cross that you’d keep it like glass.',
      },
      {
        label: '“I can’t take this.”',
        tone: 'earnest',
        reply: {
          blunt: '“You can, and you will.” {them} closes your fingers over it.',
          warm: '“You can. Please.” {them} closes your fingers over it, gently.',
        },
        warm: '“You can, and you will.” {them} closes your fingers over it and holds them shut until you stop arguing.',
        cool: '“Have it your way.” {them} takes it back, then thinks better of it and puts it in your pocket instead.',
      },
      {
        label: 'Hold it a while, then thank {them.them}.',
        tone: 'quiet',
        reply: {
          blunt: '“Now you have it,” {them} says.',
          warm: '“There. Now you have it,” {them} says, and looks lighter for it.',
        },
        warm: '{them} watches you turn it over in your hands, and is happier with that than with any thanks you could have made up.',
        cool: '“You could say whether you like it,” {them} says.',
      },
    ],
  },
  {
    id: 'talk-specialty-4-promise',
    minStage: 4,
    about: 'specialty',
    opener: {
      blunt:
        '“When I master {dream},” {them} says, “you’re going to be there. First to see it. Promise.”',
      warm: '“When I finally master {dream},” {them} says, “I want you to be the first to see it. Will you promise to be there?”',
      wry: '“When I finally master {dream},” {them} says, “I’ll need a witness, or nobody will believe me. Promise you’ll be there?”',
      formal:
        '“When I have mastered {dream},” {them} says, “I would like you to be the first to see it. Will you give me your word?”',
    },
    choices: [
      {
        label: '“I promise.”',
        tone: 'earnest',
        reply: {
          blunt: '{them} holds out a hand, and you shake on it like academy students.',
          warm: '{them} holds out a hand, and you shake on it like academy students, both of you very serious about it.',
        },
        warm: '{them} holds out a hand, and you shake on it like academy students, solemn as anything, and then both of you laugh.',
        cool: '“Don’t say it like it’s a chore.”',
      },
      {
        label: '“I’ll be in the front row with snacks.”',
        tone: 'joke',
        reply: {
          blunt: '“Bring enough for me too.”',
          warm: '“Bring enough for me too, I’ll have earned it.”',
        },
        warm: '{them} laughs. “Bring enough for me too. I’ll be starving after.”',
        cool: '“I’m serious.” {them} waits until you are too.',
      },
      {
        label: '“Only if you watch me do the same.”',
        tone: 'challenge',
        reply: {
          blunt: '“Deal, and whoever gets there last buys dinner.”',
          warm: '“Of course I will. And whoever gets there last buys dinner.”',
        },
        warm: '“You’re on.” {them} spits in {them.their} palm before you can stop {them.them}. “Whoever gets there last buys dinner for a month.”',
        cool: '“It isn’t a race, you know.” But {them} shakes on it anyway.',
      },
    ],
  },
  {
    id: 'talk-specialty-4-lesson',
    minStage: 4,
    about: 'specialty',
    opener: {
      blunt:
        '{them} stops you at the gate. “If I don’t come back one day, somebody carries my {art} on. That’s you.”',
      warm: '{them} stops you at the gate. “If I ever don’t come back, I want someone to carry my {art} on. I’d like it to be you.”',
      wry: '{them} stops you at the gate. “Morbid question. If I ever don’t come back, who gets my {art}? I’ve decided it’s you. You don’t get a say.”',
      formal:
        '{them} stops you at the gate. “Should I ever fail to come back, I would want my {art} carried on. I am asking you to be the one.”',
    },
    choices: [
      {
        label: '“Then teach me all of it.”',
        tone: 'earnest',
        reply: {
          blunt: '{them} says it slowly, so you’ll keep it. “{advice}”',
          warm: '{them} says it slowly and makes sure you have it before going on. “{advice}”',
        },
        warm: '“All of it? Then we’d better start.” {them} takes you straight back through the gate to the ground, as if there’s no time to lose. “{advice}”',
        cool: '{them} won’t promise all of it, but gives you one thing to start with. “{advice}”',
      },
      {
        label: '“You’re coming back, every time.”',
        tone: 'kind',
        reply: {
          blunt: '{them} squeezes your arm. “Then we’ll have more time for lessons.”',
          warm: '{them} squeezes your arm. “Then I suppose we’ll have more time for lessons.”',
        },
        warm: '{them} squeezes your arm hard, and for a moment doesn’t trust {them.their} voice. “Then we’ll have more time for lessons.”',
        cool: '“You can’t promise that for me,” {them} says. “That’s why I’m asking.”',
      },
      {
        label: '“Fine, but I’m doing it my way.”',
        tone: 'tease',
        reply: {
          blunt: '“Of course you are.” {them} looks oddly proud.',
          warm: '“I’d expect nothing less.” {them} looks oddly proud.',
        },
        warm: '“Of course you are. That’s why I picked you.” {them} looks oddly proud.',
        cool: '“Then it won’t be mine, will it?” {them} lets the gate swing shut between you.',
      },
    ],
  },
];
