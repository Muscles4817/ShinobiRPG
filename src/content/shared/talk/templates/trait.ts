import type { ConversationDef } from '../../../types';

/** Talk about one of someone’s traits, from their habits to the stories behind them. */
export const TRAIT_TALK: readonly ConversationDef[] = [
  {
    id: 'talk-trait-1-habit',
    minStage: 1,
    about: 'trait',
    opener: 'You catch {them} at it again: {habit}. {them.they} notice{them.s} you noticing.',
    choices: [
      {
        label: '“You always do that.”',
        tone: 'tease',
        reply: '“And you always point it out,” {them} says. “We all have our habits.”',
        warm: '“And you always point it out.” {them} laughs. “Go on, then, what’s yours? You must have one.”',
        cool: '“So?” {them} stops doing it, and you get the feeling you’ve spoiled it.',
      },
      {
        label: '“Why do you do that?”',
        tone: 'curious',
        reply: '{them} thinks about it. “I don’t know, it just feels wrong not to.”',
        warm: '{them} actually stops to think, which nobody has asked {them.them} to do before. “I don’t know. It started when I was small, I think. Now the day feels wrong without it.”',
        cool: '“Why do you ask so many questions?”',
      },
      {
        label: '“It suits you.”',
        tone: 'kind',
        reply: '“Most people tell me it’s odd,” {them} says.',
        warm: '{them} looks surprised, then pleased. “Most people tell me it’s odd. You’re the first to say otherwise.”',
        cool: "“You don’t have to say that.” {them} looks as if {them.they}{them.'s} been caught out.",
      },
    ],
  },
  {
    id: 'talk-trait-1-noticed',
    minStage: 1,
    about: 'trait',
    opener: '{them} squints at you. “You’ve been watching how I do things. Go on, you can say it.”',
    choices: [
      {
        label: '“You’re a creature of habit.”',
        tone: 'tease',
        reply: '“I know.” {them.they} show{them.s} you, {habit}. “See? I can’t help it.”',
        warm: '“I know I am.” {them} demonstrates on the spot, {habit}, with a bow at the end, as if it were a trick.',
        cool: '“And you’re nosy.” {them} keeps it up anyway, a little pointedly.',
      },
      {
        label: '“You’re very much yourself. I like it.”',
        tone: 'praise',
        reply: '“That’s not what I expected you to say.”',
        warm: '{them} goes a little pink. “That’s not what I expected you to say. Say it again, so I can remember it.”',
        cool: '{them} doesn’t trust compliments, and this one gets a long, suspicious look.',
      },
      {
        label: 'Shake your head and smile.',
        tone: 'quiet',
        reply: '“You coward,” {them} says fondly.',
        warm: '“You coward.” {them} says it fondly, and smiles back.',
        cool: '“Go on, I can take it.” When you still won’t, {them} looks a little put out.',
      },
    ],
  },
  {
    id: 'talk-trait-1-wish',
    minStage: 1,
    about: 'trait',
    opener:
      '“Do you ever wish you were someone else?” {them} asks. “Some days I’d like to be more like {wish}.”',
    choices: [
      {
        label: '“I like you as you are.”',
        tone: 'earnest',
        reply: '{them} snorts, but doesn’t argue.',
        warm: '{them} snorts, but doesn’t argue, and is still smiling about it a while later.',
        cool: '“You would say that. You don’t have to live in here.”',
      },
      {
        label: '“Some days I’d like to be a cat.”',
        tone: 'joke',
        reply: '“I’d settle for a cat’s naps and no missions.”',
        warm: '{them} laughs. “I’d be a cat with you. Naps and no missions, and everyone feeds us.”',
        cool: '“I was being serious.” {them} doesn’t bring it up again.',
      },
      {
        label: '“What would change?”',
        tone: 'curious',
        reply:
          '{them} starts to answer, then stops. “I’d change everything, or nothing. I don’t know.”',
        warm: '{them} needs two or three goes at an answer, and in the end talks it through with you for longer than either of you meant to.',
        cool: '“Forget I said it.”',
      },
    ],
  },
  {
    id: 'talk-trait-2-story',
    minStage: 2,
    about: 'trait',
    opener:
      '“I was just the same at the academy,” {them} says. “Want to hear something embarrassing?”',
    choices: [
      {
        label: '“Always.”',
        tone: 'curious',
        reply: '{story} {them} groans. “I still think about it.”',
        warm: '{them} leans in to tell it properly, with the voices. {story} “I still think about it at night,” {them.they} add{them.s}, laughing.',
        cool: '{them} tells it short, as if already sorry {them.they} offered. {story}',
      },
      {
        label: '“Only if it’s very embarrassing for you.”',
        tone: 'tease',
        reply: '“Oh, I promise you it is.” {story}',
        warm: '“Oh, it’s the worst one I have.” {them} is laughing before {them.they} get{them.s} to the end. {story}',
        cool: '“Maybe I won’t, then.” It takes a while to talk {them.them} back round. {story}',
      },
      {
        label: '“You don’t have to.”',
        tone: 'kind',
        reply: '“I want to.” {story}',
        warm: '“I want to.” {story} {them.they} smile{them.s} at the memory.',
        cool: '“I know I don’t have to. I offered.” {story}',
      },
    ],
  },
  {
    id: 'talk-trait-2-instructors',
    minStage: 2,
    about: 'trait',
    opener:
      '{them} watches a few academy students run past. “The instructors never knew what to do with me.”',
    choices: [
      {
        label: '“I can’t imagine why.”',
        tone: 'joke',
        reply: '“I was a lot. I’m told I still am.”',
        warm: '{them} shoves you, laughing. “I was a lot. I’m told I still am.”',
        cool: '“You’re very funny.” {them} watches the students instead of you.',
      },
      {
        label: '“What did you do?”',
        tone: 'curious',
        reply: '{story} “It went in my report,” {them} adds.',
        warm: '“Where do I start?” {them} picks one and tells it with relish. {story} “It went in my report twice.”',
        cool: '“Nothing I’d tell you.” Then, grudgingly, {them.they} tell{them.s} it. {story}',
      },
      {
        label: '“They should have tried harder with you.”',
        tone: 'earnest',
        reply: '“Maybe, but I didn’t make it easy for them.”',
        warm: '{them} looks at you, surprised. “Maybe they should have. You’re the first to say so. I didn’t make it easy for them, mind.”',
        cool: '“They tried hard enough, I was the problem.”',
      },
    ],
  },
  {
    id: 'talk-trait-2-since',
    minStage: 2,
    about: 'trait',
    opener:
      '“See this?” {them} says, and it’s the usual, {habit}. “I’ve done it since I was small.”',
    choices: [
      {
        label: '“Someone must have taught you.”',
        tone: 'tease',
        reply: '“Nobody taught me this. It just grows on you, like moss.”',
        warm: '“Nobody taught me this. It just grows on you, like moss.” {them} looks pleased with the line, and with you for setting it up.',
        cool: '“Nobody taught me anything,” {them} says, and the fun goes out of it.',
      },
      {
        label: '“Did it ever get you in trouble?”',
        tone: 'curious',
        reply: '“More often than I’d like,” {them} says, and doesn’t explain.',
        warm: '“Do you have all day?” {them} counts the times off on {them.their} fingers and runs out of fingers.',
        cool: '“That’s my business.” It’s said lightly, but it’s said.',
      },
      {
        label: '“I’d miss it if it went.”',
        tone: 'kind',
        reply: '{them} looks touched, and a little embarrassed.',
        warm: '{them} looks touched, and a little embarrassed, and does it again on purpose a minute later to make you laugh.',
        cool: '“I don’t think it’s going anywhere.” {them} doesn’t seem to know what to do with the kindness.',
      },
    ],
  },
];
