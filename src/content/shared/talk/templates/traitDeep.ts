import type { ConversationDef } from '../../../types';

/** Talk about one of someone’s traits between close friends: what it costs, and what it hides. */
export const TRAIT_DEEP_TALK: readonly ConversationDef[] = [
  {
    id: 'talk-trait-3-cost',
    minStage: 3,
    about: 'trait',
    opener: {
      blunt:
        '{them} is quieter than usual. When you ask, {them.they} tell{them.s} you flat out, no softening. {cost}',
      warm: '{them} is quieter than usual today, and when you ask, {them.they} take{them.s} a moment before telling you. {cost}',
      wry: '{them} is quieter than usual. “You want the sad story or the funny version? They’re the same story.” {cost}',
      formal:
        '{them} has been quiet all day. When you ask, {them.they} answer{them.s} after some thought, and choose{them.s} {them.their} words with care. {cost}',
    },
    choices: [
      {
        label: '“That wasn’t your fault.”',
        tone: 'kind',
        reply: {
          blunt: '“Some of it was my fault.”',
          warm: '“Some of it was my fault. But thank you for saying it.”',
        },
        warm: '“Some of it was my fault.” But {them} looks grateful you said it, and lets you walk {them.them} home.',
        cool: '“It was, and you don’t have to pretend otherwise.” {them} would rather you didn’t smooth it over.',
      },
      {
        label: '“Would you change, if you could?”',
        tone: 'earnest',
        reply: {
          blunt: '{them} considers it seriously. “Sometimes I would, but not today.”',
          warm: '{them} considers it seriously. “On the bad days I would. Today isn’t one of them, I think.”',
        },
        warm: '{them} considers it seriously, which you like {them.them} for. “Sometimes I would, but not today. Ask me again in a year.”',
        cool: '“That’s a big question for a Tuesday.” {them} doesn’t answer it.',
      },
      {
        label: 'Stay beside {them.them}.',
        tone: 'quiet',
        reply: {
          blunt: '{them} lets out a slow breath.',
          warm: '{them} lets out a slow breath, and seems glad of the company.',
        },
        warm: '{them} lets out a slow breath, and after a while leans on your shoulder without saying why.',
        cool: '“You can go, you know. I’m all right.” {them} isn’t, quite, but wants you to think so.',
      },
    ],
  },
  {
    id: 'talk-trait-3-admission',
    minStage: 3,
    about: 'trait',
    opener: {
      blunt:
        '{them} keeps {them.their} eyes on the ground. “I’m going to tell you something I don’t tell people. Don’t make it a thing.”',
      warm: '{them} keeps {them.their} eyes on the ground. “Can I tell you something I don’t tell people?”',
      wry: '{them} studies the ground as if it owes {them.them} money. “I’m about to tell you something I don’t tell people. It’s not too late to run.”',
      formal:
        '{them} looks at the ground for some time. “There is something I don’t tell people. I would like to tell you, if I may.”',
    },
    choices: [
      {
        label: '“You can tell me anything.”',
        tone: 'earnest',
        reply: {
          blunt:
            '“{admission}” {them.they} glance{them.s} up to see if you think less of {them.them}.',
          warm: "“{admission}” {them.they} glance{them.s} up quickly, afraid of what {them.they}{them.'s} going to see.",
        },
        warm: '“{admission}” {them.they} glance{them.s} up, and whatever {them.they} see{them.s} in your face lets {them.them} breathe out.',
        cool: '“I don’t mean anything, I mean this.” {them} says it fast, to get it over with. “{admission}”',
      },
      {
        label: '“Only if you want to.”',
        tone: 'kind',
        reply: {
          blunt: '“I do.” There’s a pause before the rest comes out. “{admission}”',
          warm: '“I do want to.” There’s a long pause before the rest comes out. “{admission}”',
        },
        warm: '“I do. That’s why it’s you.” There’s a pause before the rest comes out. “{admission}”',
        cool: '“I said I want to. Don’t make it harder for me.” There’s a pause before the rest comes out. “{admission}”',
      },
      {
        label: '“Is it that you ate my dumplings?”',
        tone: 'joke',
        reply: {
          blunt: '{them} laughs despite {them.themself}. “{admission}”',
          warm: '{them} laughs despite {them.themself}, and it helps. “{admission}”',
        },
        warm: '{them} laughs despite {them.themself}, and it makes the rest easier to say. “{admission}”',
        cool: '“I’m trying to be serious.” It takes {them} a while to start again. “{admission}”',
      },
    ],
  },
  {
    id: 'talk-trait-3-tired',
    minStage: 3,
    about: 'trait',
    opener: {
      blunt:
        "“You ever get tired of being yourself?” {them} asks. {them.they}{them.'s} not joking.",
      warm: '“Do you ever get tired of being yourself?” {them} asks, only half joking, and watches your face for the answer.',
      wry: '“Do you ever get tired of being yourself?” {them} asks. “I’d like a day off from me. Just one. I’d come back.”',
      formal:
        '“Do you ever grow tired of being yourself?” {them} asks, and it is clear {them.they} mean{them.s} the question.',
    },
    choices: [
      {
        label: '“Do you?”',
        tone: 'curious',
        reply: {
          blunt: '“Sometimes I do.” {them} tells you about the last time. {cost}',
          warm: '“Sometimes I do, yes.” {them} tells you about the last time, quietly. {cost}',
        },
        warm: '“Sometimes I do.” {them} seems relieved to be asked back, and tells you about the last time. {cost}',
        cool: '“I asked you first.” {them} answers anyway, after a while. {cost}',
      },
      {
        label: '“Every morning.”',
        tone: 'joke',
        reply: {
          blunt: '{them} laughs, more than the joke deserves.',
          warm: '{them} laughs, and looks a little less tired.',
        },
        warm: '{them} laughs properly, and the question doesn’t seem so heavy after that.',
        cool: '“I meant it, though.” {them} doesn’t laugh.',
      },
      {
        label: '“Not when I’m with friends.”',
        tone: 'earnest',
        reply: {
          blunt: '“You know, that helps.”',
          warm: '“You know, that does help. I hadn’t thought of it like that.”',
        },
        warm: '{them} looks at you a while. “You help. You know that?”',
        cool: '“That’s a nice thing for you to say.” It’s clear {them} wanted a real answer.',
      },
    ],
  },
  {
    id: 'talk-trait-4-worst',
    minStage: 4,
    about: 'trait',
    opener: {
      blunt: '“You’ve seen me at my worst,” {them} says. “You stuck around anyway. Why?”',
      warm: '“You’ve seen me at my worst,” {them} says, “and you’re still here. I don’t think I’ve said thank you.”',
      wry: '“You’ve seen me at my worst,” {them} says, “and you keep coming back. I’m starting to worry about your judgement.”',
      formal:
        '“You have seen me at my worst,” {them} says, “and you have stayed. I haven’t forgotten it.”',
    },
    choices: [
      {
        label: '“I’m not going anywhere.”',
        tone: 'earnest',
        reply: {
          blunt:
            '“Then you should know the rest.” {them} takes a breath before going on. “{admission}”',
          warm: '“Then I want you to know the rest.” {them} takes a breath before going on. “{admission}”',
        },
        warm: '“Then you should know the rest.” {them} takes a breath that goes on too long. “{admission}”',
        cool: '“People always tell me that.” But {them} tells you the rest anyway. “{admission}”',
      },
      {
        label: '“Your worst isn’t that bad.”',
        tone: 'kind',
        reply: {
          blunt: '“You liar, and thank you.”',
          warm: '“That’s a lie, and a kind one, so thank you.”',
        },
        warm: '{them} laughs, a little thickly. “You liar, and thank you.”',
        cool: '“You weren’t looking closely, then.”',
      },
      {
        label: '“Someone has to keep you honest.”',
        tone: 'tease',
        reply: {
          blunt: '“Someone has to, I suppose. I’m glad it’s you.”',
          warm: '“Someone does, and I’m glad it’s you.”',
        },
        warm: '“I suppose someone does.” {them} bumps your shoulder with {them.theirs}. “I’m glad it’s you.”',
        cool: '“Is that what you’re doing?” {them} doesn’t sound sure {them.they} want{them.s} it.',
      },
    ],
  },
  {
    id: 'talk-trait-4-promise',
    minStage: 4,
    about: 'trait',
    opener: {
      blunt:
        '{them} stops you before you leave. “If this side of me ever gets one of us hurt, you tell me straight. Promise.”',
      warm: '{them} stops you before you leave. “If this side of me ever gets one of us hurt, will you tell me? Honestly, even if it’s hard to hear?”',
      wry: '{them} stops you before you leave. “If this side of me ever gets one of us hurt, I want it from you first, before the report. Deal?”',
      formal:
        '{them} stops you before you leave. “If this side of me should ever cause one of us harm, I would want you to tell me plainly. Will you promise?”',
    },
    choices: [
      {
        label: '“I promise.”',
        tone: 'earnest',
        reply: {
          blunt: '“Good, and I’d do the same for you.”',
          warm: '“Thank you. I’d do the same for you, you know.”',
        },
        warm: '{them} looks relieved, as if {them.they} {them.has} been carrying it a while. “I’d do the same for you.”',
        cool: "“Don’t just say it, you have to mean it.” {them} waits until {them.they}{them.'s} sure you do.",
      },
      {
        label: '“You never needed to be more like {wish}.”',
        tone: 'kind',
        reply: {
          blunt: '“You remembered that.”',
          warm: '“You remembered that, after all this time.”',
        },
        warm: '{them} blinks hard. “You remembered that.”',
        cool: '“That isn’t what I asked you.” {them} wants the promise, not the comfort.',
      },
      {
        label: '“Only if you promise to listen.”',
        tone: 'challenge',
        reply: {
          blunt: '“Fine, I’ll listen, mostly.”',
          warm: '“That’s fair. I’ll try my best to listen.”',
        },
        warm: '{them} winces, then laughs. “I suppose that’s fair. I’ll listen, mostly.”',
        cool: '“I always listen.” Which you both know isn’t true, and neither of you says.',
      },
    ],
  },
  {
    id: 'talk-trait-4-yours',
    minStage: 4,
    about: 'trait',
    opener: {
      blunt: '“I’ve told you all my stories,” {them} says. “Your turn. Tell me one of yours.”',
      warm: '“I’ve told you all my stories,” {them} says. “Will you tell me one of yours? Then we’re even.”',
      wry: '“I’ve told you every embarrassing thing I’ve ever done,” {them} says. “It’s your turn, and I want a good one.”',
      formal:
        '“I have told you all my stories,” {them} says. “It seems only fair that you tell me one of yours.”',
    },
    choices: [
      {
        label: 'Tell {them.them} the thing you’ve never told anyone.',
        tone: 'earnest',
        reply: {
          blunt: '{them} listens to every word. “Thank you for trusting me with that.”',
          warm: '{them} listens to every word, and is quiet for a while afterwards. “Thank you for trusting me with that.”',
        },
        warm: '{them} listens to every word and doesn’t interrupt once. “Thank you for trusting me with that. I’ll keep it.”',
        cool: '{them} listens, but seems unsure what to do with it. “That’s a lot to give me. Thank you, I think.”',
      },
      {
        label: '“Only if you tell the academy one again.”',
        tone: 'challenge',
        reply: {
          blunt: '{them} groans, but tells it. {story}',
          warm: '{them} groans, but tells it again for you. {story}',
        },
        warm: '{them} groans, but tells it, and does all the voices. {story} You both laugh until it hurts.',
        cool: '“You’ve heard it.” {them} tells it anyway, flatly. {story}',
      },
      {
        label: '“Mine are all about you by now.”',
        tone: 'joke',
        reply: {
          blunt: '“Then tell me the ones where I look good,” {them} says.',
          warm: '“Then tell me one where I come out of it well,” {them} says.',
        },
        warm: '“Then tell me the ones where I look good,” {them} says, and settles in to listen.',
        cool: '“That’s a way out, not an answer.”',
      },
    ],
  },
];
