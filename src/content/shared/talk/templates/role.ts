import type { ConversationDef } from '../../../types';

/** Talk about what someone does all day, and what it asks of them. */
export const ROLE_TALK: readonly ConversationDef[] = [
  {
    id: 'talk-role-0-busy',
    minStage: 0,
    about: 'role',
    opener: '{them} barely looks up. “Sorry, I’m busy. It’s always {work}.”',
    choices: [
      {
        label: '“I’ll leave you to it.”',
        tone: 'kind',
        reply: '“Thank you,” {them} says, and sounds as if {them.they} mean{them.s} it.',
        warm: '“Thank you, really.” {them} actually looks up this time, long enough to see who you are. “Come back when it’s quieter and I’ll talk your ear off.”',
        cool: '{them} doesn’t notice you go.',
      },
      {
        label: '“Need a hand?”',
        tone: 'earnest',
        reply: '“Maybe another day, but thank you.”',
        warm: '{them} looks up properly. “Do you mean it? Then you hold this end.” For a few minutes you’re part of the work.',
        cool: '“From you? I’d spend longer explaining it.”',
      },
      {
        label: '“You could stand to slow down.”',
        tone: 'tease',
        reply: '“Could I?” {them} doesn’t slow down.',
        warm: '“Could I?” {them} laughs, and for one breath actually does.',
        cool: '“And you could stand to be somewhere else.”',
      },
    ],
  },
  {
    id: 'talk-role-1-days',
    minStage: 1,
    about: 'role',
    opener: '{them} stretches until {them.their} back cracks. “Most of my days are {work}.”',
    choices: [
      {
        label: '“Do you like it?”',
        tone: 'curious',
        reply: '“Most of it, I think. Ask me again at the end of the week.”',
        warm: '{them} thinks about it more than you expected. “I like the mornings best. Ask me again at the end of the week.”',
        cool: '“It doesn’t matter whether I like it.”',
      },
      {
        label: '“Sounds thrilling.”',
        tone: 'joke',
        reply: '“You have no idea,” {them} says, perfectly straight-faced.',
        warm: '“You have no idea.” {them} keeps a straight face for nearly a breath before it breaks.',
        cool: '“It keeps the village running,” {them} says, not amused.',
      },
      {
        label: '“Someone has to, and you do it well.”',
        tone: 'praise',
        reply: '{them} looks pleased despite {them.themself}.',
        warm: '{them} looks pleased despite {them.themself}, and tells you about the one day it went perfectly.',
        cool: '“You’d say that to anyone.”',
      },
    ],
  },
  {
    id: 'talk-role-1-turning-up',
    minStage: 1,
    about: 'role',
    opener:
      '“You know what nobody understands about what I do?” {them} says. “How much of it is just turning up.”',
    choices: [
      {
        label: '“Turning up is half of everything.”',
        tone: 'earnest',
        reply: '“Exactly, you get it.”',
        warm: '{them} points at you as if you’ve passed a test. “You get it. Most people your age don’t.”',
        cool: '“Half? I’d say it’s nearly all of it.”',
      },
      {
        label: '“So you’re saying it’s easy.”',
        tone: 'tease',
        reply: '“I’m saying it’s every day. You try it.”',
        warm: '“I’m saying it’s every day.” {them} gives you a look that is mostly laughing. “Try it for a month and tell me it’s easy.”',
        cool: '“That isn’t what I said.” {them} doesn’t bother saying it again.',
      },
      {
        label: '“And the other half?”',
        tone: 'curious',
        reply: '“The other half is {work}, mostly, for me.”',
        warm: '{them} likes being asked. “The other half? It’s {work}, mostly, and knowing which part of it can wait.”',
        cool: '“Work, the same as yours.” {them} leaves it there.',
      },
    ],
  },
  {
    id: 'talk-role-2-first-day',
    minStage: 2,
    about: 'role',
    opener:
      '“I remember when I started,” {them} says, smiling at nothing. “I was so sure I knew everything.”',
    choices: [
      {
        label: '“What happened?”',
        tone: 'curious',
        reply: '{memory} “I learned fast,” {them} adds.',
        warm: "{them} tells it as if {them.they}{them.'s} been waiting for someone to ask. {memory} “I learned fast after that.”",
        cool: '“What always happens to people like me.” Then, because you wait, {them.they} tell{them.s} it. {memory}',
      },
      {
        label: '“And now you really do?”',
        tone: 'tease',
        reply: '“Now I know how little I know.” {memory}',
        warm: '“Now I know how little I know.” {them} laughs, and tells you how {them.they} found out. {memory}',
        cool: '“Very clever of you.” {them} tells it anyway, without the smile. {memory}',
      },
      {
        label: '“We all start somewhere.”',
        tone: 'kind',
        reply: '{them} tells you where {them.they} started. {memory}',
        warm: '“Some of us start further back than others.” {them} tells you where {them.they} started. {memory}',
        cool: '“Some of us start in a hole.” {memory}',
      },
    ],
  },
  {
    id: 'talk-role-2-once',
    minStage: 2,
    about: 'role',
    opener:
      '{them} watches someone younger fumble at the very thing {them.they} do{them.es} every day. “That was me, once.”',
    choices: [
      {
        label: '“Who helped you?”',
        tone: 'curious',
        reply: '“Someone patient, more patient than I deserved.”',
        warm: '“Someone patient, more patient than I deserved.” {them} tells you their name, and you can hear that {them.they} still miss{them.es} them.',
        cool: '“Nobody helped me. I worked it out.” You’re not sure that’s true.',
      },
      {
        label: '“Was it as bad as that?”',
        tone: 'joke',
        reply: '“Worse than that, if you can believe it.” {memory}',
        warm: '“Worse than that, if you can believe it.” {them} laughs, and tells you. {memory}',
        cool: '“Don’t you laugh at them, they’re trying.”',
      },
      {
        label: '“You should tell them it gets easier.”',
        tone: 'earnest',
        reply: '“It never got easier for me,” {them} says. “You just get better.”',
        warm: '“It never got easier for me,” {them} says. “You just get better.” Then {them.they} go{them.es} over to help, and you watch {them.them} be patient.',
        cool: '“It doesn’t, and you shouldn’t tell people things that aren’t true.”',
      },
    ],
  },
  {
    id: 'talk-role-3-weight',
    minStage: 3,
    about: 'role',
    opener:
      '{them} looks tired in a way sleep won’t fix. You ask, and for once {them.they} answer{them.s}. {weight}',
    choices: [
      {
        label: '“You carry a lot. Let me help.”',
        tone: 'kind',
        reply: '“You already do,” {them} says.',
        warm: '“You already do,” {them} says, and means it, and doesn’t look away while saying it.',
        cool: '“You can’t. That’s the point of telling you.”',
      },
      {
        label: '“Does anyone else know?”',
        tone: 'earnest',
        reply: '“No, and I’d like to keep it that way.”',
        warm: '“Nobody but you.” {them} seems lighter for having said so.',
        cool: '“No, and don’t you go telling them.”',
      },
      {
        label: 'Sit with {them.them} a while.',
        tone: 'quiet',
        reply: 'The quiet does {them.them} good.',
        warm: "The quiet does {them.them} good. By the time you both stand up, {them.they}{them.'s} talking about tomorrow.",
        cool: 'After a while {them} says {them.they} should get back, and goes.',
      },
    ],
  },
  {
    id: 'talk-role-3-why',
    minStage: 3,
    about: 'role',
    opener: '“Some days I wonder why I keep doing this,” {them} admits.',
    choices: [
      {
        label: '“Why do you?”',
        tone: 'curious',
        reply: '{them} thinks. “Because if I stopped, someone worse might do it.”',
        warm: '{them} thinks, really thinks. “Because if I stopped, someone worse might do it. And because I’d miss it. Don’t you tell anyone that part.”',
        cool: '“If I knew, I wouldn’t be wondering.”',
      },
      {
        label: '“Then stop for a day and see how it feels.”',
        tone: 'challenge',
        reply: '“I tried once. I lasted a morning.”',
        warm: '“I tried once. I lasted a morning.” {them} laughs at {them.themself}. “Maybe I’ll try for a whole day, if you check on me.”',
        cool: '“It doesn’t work like that. People need me.”',
      },
      {
        label: '“Because you’re good at it, and people need you.”',
        tone: 'kind',
        reply: '“Thank you. I needed to hear that today.”',
        warm: '{them} lets that land. “Thank you. I needed to hear that today.”',
        cool: '“Needing me isn’t the same as me wanting to.”',
      },
    ],
  },
  {
    id: 'talk-role-4-hope',
    minStage: 4,
    about: 'role',
    opener: '{them} looks at you for a while. “Can I tell you what I hope for you?”',
    choices: [
      {
        label: '“Please.”',
        tone: 'earnest',
        reply: '“{hope}” {them.they} say{them.s} it like a promise.',
        warm: "“{hope}” {them.they} say{them.s} it like a promise, and you can tell {them.they}{them.'s} thought about it for a long while.",
        cool: '“{hope}” {them} says it quickly, almost shy of it.',
      },
      {
        label: '“That I stop eating your food?”',
        tone: 'tease',
        reply: '“That too, if you can manage it.” Then, seriously, “{hope}”',
        warm: '{them} laughs. “You could try.” Then, seriously, “{hope}”',
        cool: '“Will you let me say it?” A pause. “{hope}”',
      },
      {
        label: 'Wait for {them.them} to say it.',
        tone: 'quiet',
        reply: '“{hope}” {them} squeezes your shoulder.',
        warm: '“{hope}” {them} squeezes your shoulder and keeps {them.their} hand there a moment.',
        cool: '“You could say yes.” Then, anyway, “{hope}”',
      },
    ],
  },
  {
    id: 'talk-role-4-remember',
    minStage: 4,
    about: 'role',
    opener: '“Whatever happens to me,” {them} says, “I want you to remember one thing.”',
    choices: [
      {
        label: '“I’ll remember.”',
        tone: 'earnest',
        reply: '“{hope}” You fold the words away somewhere safe.',
        warm: '“{hope}” {them} watches you take it in, and seems satisfied that you will.',
        cool: '“You say that now.” But {them.they} tell{them.s} you. “{hope}”',
      },
      {
        label: '“Nothing’s going to happen to you.”',
        tone: 'kind',
        reply: '“Maybe you’re right. Then promise me you’ll look after yourself.” You promise.',
        warm: '{them} smiles. “Maybe you’re right. Then promise me you’ll look after yourself.” You promise, and {them.they} hold{them.s} you to it with a look.',
        cool: '“You don’t know that, and nor do I.”',
      },
      {
        label: '“Only if you promise me the same.”',
        tone: 'challenge',
        reply: '“Deal,” {them} says. “{hope}”',
        warm: '“Deal,” {them} says, and you both pretend it was a small thing. “{hope}”',
        cool: '“I’m not trading with you.” {them} says it anyway, though. “{hope}”',
      },
    ],
  },
];
