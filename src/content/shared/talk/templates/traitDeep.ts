import type { ConversationDef } from '../../../types';

/** Talk about one of someone’s traits between close friends: what it costs, and what it hides. */
export const TRAIT_DEEP_TALK: readonly ConversationDef[] = [
  {
    id: 'talk-trait-3-cost',
    minStage: 3,
    about: 'trait',
    opener:
      '{them} is quieter than usual today. When you ask, {them.they} tell{them.s} you. {cost}',
    choices: [
      {
        label: '“That wasn’t your fault.”',
        tone: 'kind',
        reply: '“Some of it was my fault.”',
        warm: '“Some of it was my fault.” But {them} looks grateful you said it, and lets you walk {them.them} home.',
        cool: '“It was, and you don’t have to pretend otherwise.” {them} would rather you didn’t smooth it over.',
      },
      {
        label: '“Would you change, if you could?”',
        tone: 'earnest',
        reply: '{them} considers it seriously. “Sometimes I would, but not today.”',
        warm: '{them} considers it seriously, which you like {them.them} for. “Sometimes I would, but not today. Ask me again in a year.”',
        cool: '“That’s a big question for a Tuesday.” {them} doesn’t answer it.',
      },
      {
        label: 'Stay beside {them.them}.',
        tone: 'quiet',
        reply: '{them} lets out a slow breath.',
        warm: '{them} lets out a slow breath, and after a while leans on your shoulder without saying why.',
        cool: '“You can go, you know. I’m all right.” {them} isn’t, quite, but wants you to think so.',
      },
    ],
  },
  {
    id: 'talk-trait-3-admission',
    minStage: 3,
    about: 'trait',
    opener:
      '{them} keeps {them.their} eyes on the ground. “Can I tell you something I don’t tell people?”',
    choices: [
      {
        label: '“You can tell me anything.”',
        tone: 'earnest',
        reply:
          '“{admission}” {them.they} glance{them.s} up to see if you think less of {them.them}.',
        warm: '“{admission}” {them.they} glance{them.s} up, and whatever {them.they} see{them.s} in your face lets {them.them} breathe out.',
        cool: '“I don’t mean anything, I mean this.” {them} says it fast, to get it over with. “{admission}”',
      },
      {
        label: '“Only if you want to.”',
        tone: 'kind',
        reply: '“I do.” A pause. “{admission}”',
        warm: '“I do. That’s why it’s you.” A pause. “{admission}”',
        cool: '“I said I want to. Don’t make it harder for me.” A pause. “{admission}”',
      },
      {
        label: '“Is it that you ate my dumplings?”',
        tone: 'joke',
        reply: '{them} laughs despite {them.themself}. “{admission}”',
        warm: '{them} laughs despite {them.themself}, and it makes the rest easier to say. “{admission}”',
        cool: '“I’m trying to be serious.” It takes {them} a while to start again. “{admission}”',
      },
    ],
  },
  {
    id: 'talk-trait-3-tired',
    minStage: 3,
    about: 'trait',
    opener: '“Do you ever get tired of being yourself?” {them} asks, only half joking.',
    choices: [
      {
        label: '“Do you?”',
        tone: 'curious',
        reply: '“Sometimes I do.” {them} tells you about the last time. {cost}',
        warm: '“Sometimes I do.” {them} seems relieved to be asked back, and tells you about the last time. {cost}',
        cool: '“I asked you first.” {them} answers anyway, after a while. {cost}',
      },
      {
        label: '“Every morning.”',
        tone: 'joke',
        reply: '{them} laughs.',
        warm: '{them} laughs properly, and the question doesn’t seem so heavy after that.',
        cool: '“I meant it, though.” {them} doesn’t laugh.',
      },
      {
        label: '“Not when I’m with friends.”',
        tone: 'earnest',
        reply: '“You know, that helps.”',
        warm: '{them} looks at you a while. “You help. You know that?”',
        cool: '“That’s a nice thing for you to say.” It’s clear {them} wanted a real answer.',
      },
    ],
  },
  {
    id: 'talk-trait-4-worst',
    minStage: 4,
    about: 'trait',
    opener: '“You’ve seen me at my worst,” {them} says. “And you’re still here.”',
    choices: [
      {
        label: '“I’m not going anywhere.”',
        tone: 'earnest',
        reply: '“Then you should know the rest.” A breath. “{admission}”',
        warm: '“Then you should know the rest.” {them} takes a breath that goes on too long. “{admission}”',
        cool: '“People always tell me that.” But {them} tells you the rest anyway. “{admission}”',
      },
      {
        label: '“Your worst isn’t that bad.”',
        tone: 'kind',
        reply: '“You liar. Thank you.”',
        warm: '{them} laughs, a little thickly. “You liar. Thank you.”',
        cool: '“You weren’t looking closely, then.”',
      },
      {
        label: '“Someone has to keep you honest.”',
        tone: 'tease',
        reply: '“Someone has to, I suppose. I’m glad it’s you.”',
        warm: '“I suppose someone does.” {them} bumps your shoulder with {them.theirs}. “I’m glad it’s you.”',
        cool: '“Is that what you’re doing?” {them} doesn’t sound sure {them.they} want{them.s} it.',
      },
    ],
  },
  {
    id: 'talk-trait-4-promise',
    minStage: 4,
    about: 'trait',
    opener:
      '{them} stops you before you leave. “If this side of me ever gets one of us hurt, tell me straight. Promise?”',
    choices: [
      {
        label: '“I promise.”',
        tone: 'earnest',
        reply: '“Good, and I’d do the same for you.”',
        warm: "{them} looks relieved, as if {them.they}{them.'s} been carrying it a while. “I’d do the same for you.”",
        cool: "“Don’t just say it, you have to mean it.” {them} waits until {them.they}{them.'s} sure you do.",
      },
      {
        label: '“You never needed to be more like {wish}.”',
        tone: 'kind',
        reply: '“You remembered that.”',
        warm: '{them} blinks hard. “You remembered that.”',
        cool: '“That isn’t what I asked you.” {them} wants the promise, not the comfort.',
      },
      {
        label: '“Only if you promise to listen.”',
        tone: 'challenge',
        reply: '“Fine, I’ll listen, mostly.”',
        warm: '{them} winces, then laughs. “I suppose that’s fair. I’ll listen, mostly.”',
        cool: '“I always listen.” Which you both know isn’t true, and neither of you says.',
      },
    ],
  },
  {
    id: 'talk-trait-4-yours',
    minStage: 4,
    about: 'trait',
    opener: '“I’ve told you all my stories,” {them} says. “Tell me one of yours. Then we’re even.”',
    choices: [
      {
        label: 'Tell {them.them} the thing you’ve never told anyone.',
        tone: 'earnest',
        reply: '{them} listens to every word. “Thank you for trusting me with that.”',
        warm: '{them} listens to every word and doesn’t interrupt once. “Thank you for trusting me with that. I’ll keep it.”',
        cool: '{them} listens, but seems unsure what to do with it. “That’s a lot to give me. Thank you, I think.”',
      },
      {
        label: '“Only if you tell the academy one again.”',
        tone: 'challenge',
        reply: '{them} groans, but tells it. {story}',
        warm: '{them} groans, but tells it, and does all the voices. {story} You both laugh until it hurts.',
        cool: '“You’ve heard it.” {them} tells it anyway, flatly. {story}',
      },
      {
        label: '“Mine are all about you by now.”',
        tone: 'joke',
        reply: '“Then tell me the ones where I look good,” {them} says.',
        warm: '“Then tell me the ones where I look good,” {them} says, and settles in to listen.',
        cool: '“That’s a way out, not an answer.”',
      },
    ],
  },
];
