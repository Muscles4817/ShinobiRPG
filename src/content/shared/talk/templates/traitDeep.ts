import type { ConversationDef } from '../../../types';

/** Talk about one of someone’s traits between close friends: what it costs, and what it hides. */
export const TRAIT_DEEP_TALK: readonly ConversationDef[] = [
  {
    id: 'talk-trait-3-cost',
    minStage: 3,
    about: 'trait',
    opener: '{them} is quieter than usual today. When you ask, they tell you. {cost}',
    choices: [
      {
        label: '“That wasn’t your fault.”',
        tone: 'kind',
        reply: '“Some of it was.” But {them} looks grateful you said it.',
      },
      {
        label: '“Would you change, if you could?”',
        tone: 'earnest',
        reply: '{them} considers it seriously. “Sometimes. Not today.”',
      },
      {
        label: 'Stay beside them.',
        tone: 'quiet',
        reply: '{them} lets out a slow breath. It seems to help that you stayed.',
      },
    ],
  },
  {
    id: 'talk-trait-3-admission',
    minStage: 3,
    about: 'trait',
    opener:
      '{them} keeps their eyes on the ground. “Can I tell you something I don’t tell people?”',
    choices: [
      {
        label: '“Anything.”',
        tone: 'earnest',
        reply: '“{admission}” They glance up to see if you think less of them.',
      },
      {
        label: '“Only if you want to.”',
        tone: 'kind',
        reply: '“I do.” A pause. “{admission}”',
      },
      {
        label: '“Is it that you ate my dumplings?”',
        tone: 'joke',
        reply: '{them} laughs despite themselves, then sobers. “{admission}”',
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
        reply: '“Sometimes.” {them} tells you about the last time. {cost}',
      },
      {
        label: '“Every morning.”',
        tone: 'joke',
        reply: '{them} laughs, and it seems to loosen something.',
      },
      {
        label: '“Not when I’m with friends.”',
        tone: 'earnest',
        reply: '{them} looks at you a long while. “Yes. That helps.”',
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
        reply: '{them} nods slowly. “Then you should know the rest.” A breath. “{admission}”',
      },
      {
        label: '“Your worst isn’t that bad.”',
        tone: 'kind',
        reply: '{them} laughs, a little thickly. “Liar. Thank you.”',
      },
      {
        label: '“Someone has to keep you honest.”',
        tone: 'tease',
        reply: '“Someone does,” {them} agrees. “I’m glad it’s you.”',
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
        reply: '“Good.” {them} looks relieved. “I’d do the same for you.”',
      },
      {
        label: '“You never needed to be more like {wish}.”',
        tone: 'kind',
        reply: '{them} blinks hard. “You remembered that.”',
      },
      {
        label: '“Only if you promise to listen.”',
        tone: 'challenge',
        reply: '{them} winces, then laughs. “Fine. I’ll listen. Mostly.”',
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
        label: 'Tell them something you’ve never told anyone.',
        tone: 'earnest',
        reply: '{them} listens to every word. “Thank you for trusting me with that.”',
      },
      {
        label: '“Only if you tell the academy one again.”',
        tone: 'challenge',
        reply: '{them} groans, but tells it. {story} You both laugh until it hurts.',
      },
      {
        label: '“Mine are all about you by now.”',
        tone: 'joke',
        reply: '“Then tell me the ones where I look good,” {them} says, grinning.',
      },
    ],
  },
];
