import type { ConversationDef } from '../../../types';

/** Talk about one of someone’s traits, from their habits to the stories behind them. */
export const TRAIT_TALK: readonly ConversationDef[] = [
  {
    id: 'talk-trait-1-habit',
    minStage: 1,
    about: 'trait',
    opener: {
      blunt:
        'You catch {them} {habit}, again. {them.they} see{them.s} you looking and stare{them.s} straight back.',
      warm: 'You catch {them} at it again, {habit}, and {them.they} notice{them.s} you noticing and go{them.es} a little pink.',
      wry: 'You catch {them} {habit}, again. {them.they} notice{them.s} you noticing, and keep{them.s} going with great dignity.',
      formal:
        'You come across {them} {habit}, as usual. {them.they} notice{them.s} your attention and pause{them.s}, politely, to let you speak.',
    },
    choices: [
      {
        label: '“You always do that.”',
        tone: 'tease',
        reply: {
          blunt: '“And you always point it out,” {them} says. “We all have our habits.”',
          warm: '“I know I do. And you always notice,” {them} says. “I suppose we all have our habits.”',
        },
        warm: '“And you always point it out.” {them} laughs. “Go on, then, what’s yours? You must have one.”',
        cool: '“So?” {them} stops doing it, and you get the feeling you’ve spoiled it.',
      },
      {
        label: '“Why do you do that?”',
        tone: 'curious',
        reply: {
          blunt: '{them} thinks about it. “I don’t know, it just feels wrong not to.”',
          warm: '{them} thinks about it. “I’m not sure. I think it makes me feel like myself.”',
        },
        warm: '{them} actually stops to think, which nobody has asked {them.them} to do before. “I don’t know. It started when I was small, I think. Now the day feels wrong without it.”',
        cool: '“Why do you ask so many questions?”',
      },
      {
        label: '“It suits you.”',
        tone: 'kind',
        reply: {
          blunt: '“Most people tell me it’s odd,” {them} says.',
          warm: '“Does it? Most people tell me it’s odd,” {them} says, pleased in spite of {them.themself}.',
        },
        warm: '{them} looks surprised, then pleased. “Most people tell me it’s odd. You’re the first to say otherwise.”',
        cool: '“You don’t have to say that.” {them} looks as if {them.they} {them.has} been caught out.',
      },
    ],
  },
  {
    id: 'talk-trait-1-noticed',
    minStage: 1,
    about: 'trait',
    opener: {
      blunt: '{them} squints at you. “You’ve been watching how I do things. Say it.”',
      warm: '{them} catches your eye and smiles. “You’ve been watching how I do things, haven’t you? Go on, you can say it.”',
      wry: '{them} squints at you. “You’ve had a look on your face all week, like you’re writing a report on me. Let’s hear the findings.”',
      formal:
        '{them} turns to you. “I have the impression you’ve been observing how I do things. Please, say whatever it is.”',
    },
    choices: [
      {
        label: '“You’re a creature of habit.”',
        tone: 'tease',
        reply: {
          blunt: '“I know.” {them.they} show{them.s} you, {habit}. “See? I can’t help it.”',
          warm: '“I know I am.” {them.they} show{them.s} you, {habit}. “I’ve never been able to help it.”',
        },
        warm: '“I know I am.” {them} demonstrates on the spot, {habit}, with a bow at the end, as if it were a trick.',
        cool: '“And you’re nosy.” {them} keeps it up anyway, a little pointedly.',
      },
      {
        label: '“You’re very much yourself. I like it.”',
        tone: 'praise',
        reply: {
          blunt: '“That’s not what I expected you to say.”',
          warm: '“Oh. That’s not what I expected you to say, but I’ll take it.”',
        },
        warm: '{them} goes a little pink. “That’s not what I expected you to say. Say it again, so I can remember it.”',
        cool: '{them} doesn’t trust compliments, and this one gets a long, suspicious look.',
      },
      {
        label: 'Shake your head and smile.',
        tone: 'quiet',
        reply: {
          blunt: '“You coward,” {them} says fondly.',
          warm: '“Too polite to say it? You coward,” {them} says fondly.',
        },
        warm: '“You coward.” {them} says it fondly, and smiles back.',
        cool: '“Go on, I can take it.” When you still won’t, {them} looks a little put out.',
      },
    ],
  },
  {
    id: 'talk-trait-1-wish',
    minStage: 1,
    about: 'trait',
    opener: {
      blunt:
        '“You ever wish you were someone else?” {them} asks. “Some days I want to be more like {wish}.”',
      warm: '“Do you ever wish you were someone else?” {them} asks. “Some days I’d like to be more like {wish}. Is that silly?”',
      wry: '“Do you ever want to trade yourself in?” {them} asks. “Some days I’d swap me for {wish}, and not even ask for change.”',
      formal:
        '“Do you ever wish you were otherwise?” {them} asks. “There are days I would like to be more like {wish}.”',
    },
    choices: [
      {
        label: '“I like you as you are.”',
        tone: 'earnest',
        reply: {
          blunt: '{them} snorts, but doesn’t argue.',
          warm: '{them} doesn’t argue, which from {them.them} is as good as agreeing.',
        },
        warm: '{them} snorts, but doesn’t argue, and is still smiling about it a while later.',
        cool: '“You would say that. You don’t have to live in here.”',
      },
      {
        label: '“Some days I’d like to be a cat.”',
        tone: 'joke',
        reply: {
          blunt: '“I’d settle for a cat’s naps and no missions.”',
          warm: '“That doesn’t sound so bad. I’d settle for a cat’s naps and no missions.”',
        },
        warm: '{them} laughs. “I’d be a cat with you. Naps and no missions, and everyone feeds us.”',
        cool: '“I was being serious.” {them} doesn’t bring it up again.',
      },
      {
        label: '“What would change?”',
        tone: 'curious',
        reply: {
          blunt:
            '{them} starts to answer, then stops. “I’d change everything, or nothing. I don’t know.”',
          warm: '{them} starts to answer, then stops. “I don’t know, really. Maybe I’d just worry less.”',
        },
        warm: '{them} needs two or three goes at an answer, and in the end talks it through with you for longer than either of you meant to.',
        cool: '“Forget I said it.”',
      },
    ],
  },
  {
    id: 'talk-trait-2-story',
    minStage: 2,
    about: 'trait',
    opener: {
      blunt:
        '“I was the same at the academy,” {them} says. “Worse, probably. Want to hear something embarrassing?”',
      warm: '“I was just the same at the academy,” {them} says. “Can I tell you something embarrassing? You have to promise not to laugh too hard.”',
      wry: '“You think I’m bad now,” {them} says. “You should have met me at the academy. I have a story. It does me no credit at all.”',
      formal:
        '“I was much the same at the academy,” {them} says. “There is one episode in particular I still find embarrassing, if you would like to hear it.”',
    },
    choices: [
      {
        label: '“Always.”',
        tone: 'curious',
        reply: {
          blunt: '{story} {them} groans. “I still think about it.”',
          warm: '{story} {them} hides {them.their} face for a moment. “I still think about it, you know.”',
        },
        warm: '{them} leans in to tell it properly, with the voices. {story} “I still think about it at night,” {them.they} add{them.s}, laughing.',
        cool: '{them} tells it short, as if already sorry {them.they} offered. {story}',
      },
      {
        label: '“Only if it’s very embarrassing for you.”',
        tone: 'tease',
        reply: {
          blunt: '“Oh, I promise you it is.” {story}',
          warm: '“It’s very embarrassing, I promise you.” {story}',
        },
        warm: '“Oh, it’s the worst one I have.” {them} is laughing before {them.they} get{them.s} to the end. {story}',
        cool: '“Maybe I won’t, then.” It takes a while to talk {them.them} back round. {story}',
      },
      {
        label: '“You don’t have to.”',
        tone: 'kind',
        reply: {
          blunt: '“I want to.” {story}',
          warm: '“I know, but I’d like to.” {story}',
        },
        warm: '“I want to.” {story} {them.they} smile{them.s} at the memory.',
        cool: '“I know I don’t have to. I offered.” {story}',
      },
    ],
  },
  {
    id: 'talk-trait-2-instructors',
    minStage: 2,
    about: 'trait',
    opener: {
      blunt:
        '{them} watches a few academy students run past. “The instructors never knew what to do with me. Still don’t, I bet.”',
      warm: '{them} watches a few academy students run past, smiling. “Poor instructors. They never knew what to do with me.”',
      wry: '{them} watches a few academy students run past. “I wonder if they still warn the new instructors about me. They should.”',
      formal:
        '{them} watches a few academy students run past. “I was not an easy student. I don’t think the instructors ever quite knew how to manage me.”',
    },
    choices: [
      {
        label: '“I can’t imagine why.”',
        tone: 'joke',
        reply: {
          blunt: '“I was a lot. I’m told I still am.”',
          warm: '“I was a lot, I think. People are kind enough to tell me I still am.”',
        },
        warm: '{them} shoves you, laughing. “I was a lot. I’m told I still am.”',
        cool: '“You’re very funny.” {them} watches the students instead of you.',
      },
      {
        label: '“What did you do?”',
        tone: 'curious',
        reply: {
          blunt: '{story} “It went in my report,” {them} adds.',
          warm: '{story} “It went in my report, and my family heard all about it,” {them} adds.',
        },
        warm: '“Where do I start?” {them} picks one and tells it with relish. {story} “It went in my report twice.”',
        cool: '“Nothing I’d tell you.” Then, grudgingly, {them.they} tell{them.s} it. {story}',
      },
      {
        label: '“They should have tried harder with you.”',
        tone: 'earnest',
        reply: {
          blunt: '“Maybe, but I didn’t make it easy for them.”',
          warm: '“That’s kind of you. I didn’t make it easy for them, though.”',
        },
        warm: '{them} looks at you, surprised. “Maybe they should have. You’re the first to say so. I didn’t make it easy for them, mind.”',
        cool: '“They tried hard enough, I was the problem.”',
      },
    ],
  },
  {
    id: 'talk-trait-2-since',
    minStage: 2,
    about: 'trait',
    opener: {
      blunt: '“See this?” {them} says, {habit}. “Been doing it since I was small.”',
      warm: '“Look,” {them} says, {habit}, as usual. “I’ve done this since I was small. My family used to tease me about it.”',
      wry: '“Behold,” {them} says, {habit}, as ever. “I’ve been doing it since I was small. Some people collect stamps.”',
      formal:
        '“You have seen this before,” {them} says, {habit}, as usual. “I have done it since I was very young.”',
    },
    choices: [
      {
        label: '“Someone must have taught you.”',
        tone: 'tease',
        reply: {
          blunt: '“Nobody taught me this. It just grows on you, like moss.”',
          warm: '“Nobody taught me. I think it just grew, the way moss does.”',
        },
        warm: '“Nobody taught me this. It just grows on you, like moss.” {them} looks pleased with the line, and with you for setting it up.',
        cool: '“Nobody taught me anything,” {them} says, and the fun goes out of it.',
      },
      {
        label: '“Did it ever get you in trouble?”',
        tone: 'curious',
        reply: {
          blunt: '“More often than I’d like,” {them} says, and doesn’t explain.',
          warm: '“More often than I’d like to admit,” {them} says, and laughs instead of explaining.',
        },
        warm: '“Do you have all day?” {them} counts the times off on {them.their} fingers and runs out of fingers.',
        cool: '“That’s my business.” It’s said lightly, but it’s said.',
      },
      {
        label: '“I’d miss it if it went.”',
        tone: 'kind',
        reply: {
          blunt: '{them} looks touched, and a little embarrassed.',
          warm: "{them} looks touched, and a little embarrassed, and says {them.they}{them.'s} glad.",
        },
        warm: '{them} looks touched, and a little embarrassed, and does it again on purpose a minute later to make you laugh.',
        cool: '“I don’t think it’s going anywhere.” {them} doesn’t seem to know what to do with the kindness.',
      },
    ],
  },
];
