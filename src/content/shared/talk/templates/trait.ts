import type { ConversationDef } from '../../../types';

/** Talk about one of someone’s traits, from their habits to the stories behind them. */
export const TRAIT_TALK: readonly ConversationDef[] = [
  {
    id: 'talk-trait-1-habit',
    minStage: 1,
    about: 'trait',
    opener: 'You catch {them} at it again: {habit}. They notice you noticing.',
    choices: [
      {
        label: '“You always do that.”',
        tone: 'tease',
        reply: '“And you always point it out,” {them} says. “We all have our habits.”',
      },
      {
        label: '“Why do you do that?”',
        tone: 'curious',
        reply: '{them} thinks about it. “I don’t know. It feels wrong not to.”',
      },
      {
        label: '“It suits you.”',
        tone: 'kind',
        reply: '{them} looks surprised, then pleased. “Most people find it odd.”',
      },
    ],
  },
  {
    id: 'talk-trait-1-noticed',
    minStage: 1,
    about: 'trait',
    opener: '{them} squints at you. “You’ve been watching how I do things. Go on, say it.”',
    choices: [
      {
        label: '“You’re a creature of habit.”',
        tone: 'tease',
        reply: '“Guilty.” They show you: {habit}. “See? Can’t help it.”',
      },
      {
        label: '“You’re very much yourself. I like it.”',
        tone: 'praise',
        reply: '{them} goes a little pink. “That’s not what I expected you to say.”',
      },
      {
        label: 'Shake your head and smile.',
        tone: 'quiet',
        reply: '“Coward,” {them} says fondly.',
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
        reply: '{them} snorts, but they don’t argue.',
      },
      {
        label: '“Some days I’d like to be a cat.”',
        tone: 'joke',
        reply: '{them} laughs. “Fair. Naps and no missions.”',
      },
      {
        label: '“What would change?”',
        tone: 'curious',
        reply: '{them} starts to answer, then shrugs. “Everything. Nothing. I don’t know.”',
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
      },
      {
        label: '“Only if it’s very embarrassing.”',
        tone: 'tease',
        reply: '“Oh, it is.” {story}',
      },
      {
        label: '“You don’t have to.”',
        tone: 'kind',
        reply: '“I want to.” {story} They smile at the memory.',
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
        reply: '{them} shoves you, laughing. “I was a lot. I’m told I still am.”',
      },
      {
        label: '“What did you do?”',
        tone: 'curious',
        reply: '{story} “It went in my report,” {them} adds.',
      },
      {
        label: '“They should have tried harder.”',
        tone: 'earnest',
        reply: '{them} looks at you, surprised. “Maybe. I didn’t make it easy for them.”',
      },
    ],
  },
  {
    id: 'talk-trait-2-since',
    minStage: 2,
    about: 'trait',
    opener:
      '“See this?” {them} says, and it’s the usual: {habit}. “I’ve done it since I was small.”',
    choices: [
      {
        label: '“Someone must have taught you.”',
        tone: 'tease',
        reply: '“Nobody teaches this. It just grows, like moss.”',
      },
      {
        label: '“Did it ever get you in trouble?”',
        tone: 'curious',
        reply: '“Constantly.” {them} grins at some old memory and doesn’t explain.',
      },
      {
        label: '“I’d miss it if it went.”',
        tone: 'kind',
        reply: '{them} looks touched, and a little embarrassed.',
      },
    ],
  },
];
