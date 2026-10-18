import type { ConversationDef } from '../../../types';

/** Talk about what someone does all day, and what it asks of them. */
export const ROLE_TALK: readonly ConversationDef[] = [
  {
    id: 'talk-role-0-busy',
    minStage: 0,
    about: 'role',
    opener: {
      blunt: '{them} doesn’t look up. “Busy. It’s always {work}.”',
      warm: '{them} glances up and smiles an apology. “Sorry, I’m in the middle of it. It’s always {work}.”',
      wry: '{them} barely looks up. “If you’re here to help, wonderful. If not, it’s {work}, as ever, and I’m behind.”',
      formal: '{them} looks up briefly. “Forgive me, I can’t stop for long. It is always {work}.”',
    },
    choices: [
      {
        label: '“I’ll leave you to it.”',
        tone: 'kind',
        reply: {
          blunt: '“Thank you,” {them} says, and sounds as if {them.they} mean{them.s} it.',
          warm: '“Thank you, that’s kind,” {them} says, and sounds as if {them.they} mean{them.s} it.',
        },
        warm: '“Thank you, really.” {them} actually looks up this time, long enough to see who you are. “Come back when it’s quieter and I’ll talk your ear off.”',
        cool: '{them} doesn’t notice you go.',
      },
      {
        label: '“Need a hand?”',
        tone: 'earnest',
        reply: {
          blunt: '“Maybe another day, but thank you.”',
          warm: '“Not today, but it’s good of you to ask.”',
        },
        warm: '{them} looks up properly. “Do you mean it? Then you hold this end.” For a few minutes you’re part of the work.',
        cool: '“From you? I’d spend longer explaining it.”',
      },
      {
        label: '“You could stand to slow down.”',
        tone: 'tease',
        reply: {
          blunt: '“Could I?” {them} doesn’t slow down.',
          warm: '“I could, couldn’t I?” {them} doesn’t slow down.',
        },
        warm: '“Could I?” {them} laughs, and for one breath actually does.',
        cool: '“And you could stand to be somewhere else.”',
      },
    ],
  },
  {
    id: 'talk-role-1-days',
    minStage: 1,
    about: 'role',
    opener: {
      blunt: '{them} stretches until {them.their} back cracks. “Most of my days are {work}.”',
      warm: '{them} stretches until {them.their} back cracks, and laughs at the sound. “Most of my days are {work}. You get used to it.”',
      wry: '{them} stretches until {them.their} back cracks. “Another thrilling day of {work}. Don’t be jealous.”',
      formal:
        '{them} stretches, carefully. “Most of my days are spent on {work}. One learns to find a rhythm in it.”',
    },
    choices: [
      {
        label: '“Do you like it?”',
        tone: 'curious',
        reply: {
          blunt: '“Most of it, I think. Ask me again at the end of the week.”',
          warm: '“Most of it, I think. Ask me again at the end of the week and I might say something different.”',
        },
        warm: '{them} thinks about it more than you expected. “I like the mornings best. Ask me again at the end of the week.”',
        cool: '“It doesn’t matter whether I like it.”',
      },
      {
        label: '“Sounds thrilling.”',
        tone: 'joke',
        reply: {
          blunt: '“You have no idea,” {them} says, perfectly straight-faced.',
          warm: '“You have no idea,” {them} says, and can’t quite keep a straight face.',
        },
        warm: '“You have no idea.” {them} keeps a straight face for nearly a breath before it breaks.',
        cool: '“It keeps the village running,” {them} says, not amused.',
      },
      {
        label: '“Someone has to, and you do it well.”',
        tone: 'praise',
        reply: {
          blunt: '{them} looks pleased despite {them.themself}.',
          warm: '{them} looks pleased despite {them.themself}, and thanks you.',
        },
        warm: '{them} looks pleased despite {them.themself}, and tells you about the one day it went perfectly.',
        cool: '“You’d say that to anyone.”',
      },
    ],
  },
  {
    id: 'talk-role-1-turning-up',
    minStage: 1,
    about: 'role',
    opener: {
      blunt:
        '“Know what nobody gets about what I do?” {them} says. “It’s mostly turning up. Every day.”',
      warm: '“Do you know what people don’t see about what I do?” {them} says. “How much of it is just turning up, day after day.”',
      wry: '“The secret of what I do,” {them} says, “is turning up. That’s it. That’s the whole secret. I should charge for it.”',
      formal:
        '“What few people understand about my work,” {them} says, “is how much of it is simply being there, every day.”',
    },
    choices: [
      {
        label: '“Turning up is half of everything.”',
        tone: 'earnest',
        reply: {
          blunt: '“Exactly, you get it.”',
          warm: '“That’s it exactly. I’m glad you see it.”',
        },
        warm: '{them} points at you as if you’ve passed a test. “You get it. Most people your age don’t.”',
        cool: '“Half? I’d say it’s nearly all of it.”',
      },
      {
        label: '“So you’re saying it’s easy.”',
        tone: 'tease',
        reply: {
          blunt: '“I’m saying it’s every day. You try it.”',
          warm: '“I’m saying it’s every day, which isn’t the same thing at all.”',
        },
        warm: '“I’m saying it’s every day.” {them} gives you a look that is mostly laughing. “Try it for a month and tell me it’s easy.”',
        cool: '“That isn’t what I said.” {them} doesn’t bother saying it again.',
      },
      {
        label: '“And the other half?”',
        tone: 'curious',
        reply: {
          blunt: '“The other half is {work}, mostly, for me.”',
          warm: '“For me, the other half is {work}, and caring how it’s done.”',
        },
        warm: '{them} likes being asked. “The other half? It’s {work}, mostly, and knowing which part of it can wait.”',
        cool: '“Work, the same as yours.” {them} leaves it there.',
      },
    ],
  },
  {
    id: 'talk-role-2-first-day',
    minStage: 2,
    about: 'role',
    opener: {
      blunt: '“When I started,” {them} says, “I thought I knew everything. I knew nothing.”',
      warm: '“I remember when I started,” {them} says, smiling at nothing. “I was so sure I knew everything.”',
      wry: '“When I started,” {them} says, “I knew everything. It took about a week to find out I knew nothing, which was quick for me.”',
      formal:
        '“When I began,” {them} says, “I was quite certain I understood everything. I was mistaken.”',
    },
    choices: [
      {
        label: '“What happened?”',
        tone: 'curious',
        reply: {
          blunt: '{memory} “I learned fast,” {them} adds.',
          warm: '{memory} “I learned fast after that, and I was grateful for it,” {them} adds.',
        },
        warm: '{them} tells it as if {them.they} {them.has} been waiting for someone to ask. {memory} “I learned fast after that.”',
        cool: '“What always happens to people like me.” Then, because you wait, {them.they} tell{them.s} it. {memory}',
      },
      {
        label: '“And now you really do?”',
        tone: 'tease',
        reply: {
          blunt: '“Now I know how little I know.” {memory}',
          warm: '“Now I know how little I know, which is a start.” {memory}',
        },
        warm: '“Now I know how little I know.” {them} laughs, and tells you how {them.they} found out. {memory}',
        cool: '“Very clever of you.” {them} tells it anyway, without the smile. {memory}',
      },
      {
        label: '“We all start somewhere.”',
        tone: 'kind',
        reply: {
          blunt: '{them} tells you where {them.they} started. {memory}',
          warm: '{them} tells you where {them.they} started, and doesn’t leave out the hard parts. {memory}',
        },
        warm: '“Some of us start further back than others.” {them} tells you where {them.they} started. {memory}',
        cool: '“Some of us start in a hole.” {memory}',
      },
    ],
  },
  {
    id: 'talk-role-2-once',
    minStage: 2,
    about: 'role',
    opener: {
      blunt:
        '{them} watches someone younger fumble at the very thing {them.they} do{them.es} every day. “That was me.”',
      warm: '{them} watches someone younger fumble at the very thing {them.they} do{them.es} every day, and {them.their} face softens. “That was me, once.”',
      wry: '{them} watches someone younger fumble at the very thing {them.they} do{them.es} every day. “Oh, look. It’s me, a few years ago, only with better hair.”',
      formal:
        '{them} watches someone younger struggle at the very thing {them.they} do{them.es} every day. “I was exactly like that, once.”',
    },
    choices: [
      {
        label: '“Who helped you?”',
        tone: 'curious',
        reply: {
          blunt: '“Someone patient, more patient than I deserved.”',
          warm: '“Someone very patient, much more patient than I deserved.”',
        },
        warm: '“Someone patient, more patient than I deserved.” {them} tells you their name, and you can hear that {them.they} still miss{them.es} them.',
        cool: '“Nobody helped me. I worked it out.” You’re not sure that’s true.',
      },
      {
        label: '“Was it as bad as that?”',
        tone: 'joke',
        reply: {
          blunt: '“Worse than that, if you can believe it.” {memory}',
          warm: '“Worse, I’m afraid, much worse.” {memory}',
        },
        warm: '“Worse than that, if you can believe it.” {them} laughs, and tells you. {memory}',
        cool: '“Don’t you laugh at them, they’re trying.”',
      },
      {
        label: '“You should tell them it gets easier.”',
        tone: 'earnest',
        reply: {
          blunt: '“It never got easier for me,” {them} says. “You just get better.”',
          warm: '“I don’t think it gets easier,” {them} says. “You just get better at it. I’ll tell them that.”',
        },
        warm: '“It never got easier for me,” {them} says. “You just get better.” Then {them.they} go{them.es} over to help, and you watch {them.them} be patient.',
        cool: '“It doesn’t, and you shouldn’t tell people things that aren’t true.”',
      },
    ],
  },
];
