import type { ConversationDef } from '../../../types';

/** Talk about what someone’s work asks of them, between close friends, and what they hope for you. */
export const ROLE_DEEP_TALK: readonly ConversationDef[] = [
  {
    id: 'talk-role-3-weight',
    minStage: 3,
    about: 'role',
    opener: {
      blunt:
        '{them} looks worn through. You ask, and for once {them.they} answer{them.s} without dodging. {weight}',
      warm: '{them} looks tired in a way sleep won’t fix. You ask, gently, and for once {them.they} answer{them.s}. {weight}',
      wry: '{them} looks tired in a way sleep won’t fix. “I’d make a joke,” {them.they} say{them.s} when you ask, “but I’m out.” {weight}',
      formal:
        '{them} looks tired in a way rest will not mend. When you ask, {them.they} answer{them.s}, for once, without deflecting. {weight}',
    },
    choices: [
      {
        label: '“You carry a lot. Let me help.”',
        tone: 'kind',
        reply: {
          blunt: '“You already do,” {them} says.',
          warm: '“You already do, more than you know,” {them} says.',
        },
        warm: '“You already do,” {them} says, and means it, and doesn’t look away while saying it.',
        cool: '“You can’t. That’s the point of telling you.”',
      },
      {
        label: '“Does anyone else know?”',
        tone: 'earnest',
        reply: {
          blunt: '“No, and I’d like to keep it that way.”',
          warm: '“No. I’d like to keep it that way, if you don’t mind.”',
        },
        warm: '“Nobody but you.” {them} seems lighter for having said so.',
        cool: '“No, and don’t you go telling them.”',
      },
      {
        label: 'Sit with {them.them} a while.',
        tone: 'quiet',
        reply: {
          blunt: 'The quiet does {them.them} good.',
          warm: 'The quiet does {them.them} good, and {them.they} thank{them.s} you for it when you part.',
        },
        warm: "The quiet does {them.them} good. By the time you both stand up, {them.they}{them.'s} talking about tomorrow.",
        cool: 'After a while {them} says {them.they} should get back, and goes.',
      },
    ],
  },
  {
    id: 'talk-role-3-why',
    minStage: 3,
    about: 'role',
    opener: {
      blunt: '“Some days I don’t know why I keep doing this,” {them} says.',
      warm: '“Can I admit something? Some days I wonder why I keep doing this,” {them} says.',
      wry: '“Remind me why I do this,” {them} says. “I had a reason. I wrote it down somewhere.”',
      formal: '“There are days,” {them} says, “when I am not certain why I continue.”',
    },
    choices: [
      {
        label: '“Why do you?”',
        tone: 'curious',
        reply: {
          blunt: '{them} thinks it over. “Because if I stopped, someone worse might do it.”',
          warm: '{them} thinks about it. “Because if I stopped, someone who cared less might do it.”',
        },
        warm: '{them} thinks, really thinks. “Because if I stopped, someone worse might do it. And because I’d miss it. Don’t you tell anyone that part.”',
        cool: '“If I knew, I wouldn’t be wondering.”',
      },
      {
        label: '“Then stop for a day and see how it feels.”',
        tone: 'challenge',
        reply: {
          blunt: '“I tried once. I lasted a morning.”',
          warm: '“I tried that once, you know. I lasted a morning before I went back.”',
        },
        warm: '“I tried once. I lasted a morning.” {them} laughs at {them.themself}. “Maybe I’ll try for a whole day, if you check on me.”',
        cool: '“It doesn’t work like that. People need me.”',
      },
      {
        label: '“Because you’re good at it, and people need you.”',
        tone: 'kind',
        reply: {
          blunt: '“Thank you. I needed to hear that today.”',
          warm: '“Thank you. I think I needed someone to say that today.”',
        },
        warm: '{them} lets that land. “Thank you. I needed to hear that today.”',
        cool: '“Needing me isn’t the same as me wanting to.”',
      },
    ],
  },
  {
    id: 'talk-role-4-hope',
    minStage: 4,
    about: 'role',
    opener: {
      blunt: '{them} looks at you for a while. “I’m going to tell you what I hope for you.”',
      warm: '{them} looks at you for a while. “Can I tell you what I hope for you?”',
      wry: '{them} looks at you for a while. “I’ve been thinking about your future, which is more than you do. Can I tell you what I hope for you?”',
      formal: '{them} regards you for a while. “May I tell you what I hope for you?”',
    },
    choices: [
      {
        label: '“Please.”',
        tone: 'earnest',
        reply: {
          blunt: '“{hope}” {them.they} say{them.s} it like a promise.',
          warm: '“{hope}” {them.they} say{them.s} it softly, like a promise.',
        },
        warm: '“{hope}” {them.they} say{them.s} it like a promise, and you can tell {them.they} {them.has} thought about it for a long while.',
        cool: '“{hope}” {them} says it quickly, almost shy of it.',
      },
      {
        label: '“That I stop eating your food?”',
        tone: 'tease',
        reply: {
          blunt: '“That too, if you can manage it.” Then, seriously, “{hope}”',
          warm: '“That would be nice too.” Then, seriously, “{hope}”',
        },
        warm: '{them} laughs. “You could try.” Then, seriously, “{hope}”',
        cool: '“Will you let me say it?” There’s a pause before {them.they} go{them.es} on. “{hope}”',
      },
      {
        label: 'Wait for {them.them} to say it.',
        tone: 'quiet',
        reply: {
          blunt: '“{hope}” {them} squeezes your shoulder.',
          warm: '“{hope}” {them} squeezes your shoulder, gently.',
        },
        warm: '“{hope}” {them} squeezes your shoulder and keeps {them.their} hand there a moment.',
        cool: '“You could say yes.” Then, anyway, “{hope}”',
      },
    ],
  },
  {
    id: 'talk-role-4-remember',
    minStage: 4,
    about: 'role',
    opener: {
      blunt: '“Whatever happens to me,” {them} says, “remember one thing.”',
      warm: '“Whatever happens to me,” {them} says, “there’s one thing I want you to remember.”',
      wry: '“In case I’m ever flattened by a falling boulder,” {them} says, “there’s one thing I want you to remember.”',
      formal: '“Whatever becomes of me,” {them} says, “I would ask you to remember one thing.”',
    },
    choices: [
      {
        label: '“I’ll remember.”',
        tone: 'earnest',
        reply: {
          blunt: '“{hope}” You fold the words away somewhere safe.',
          warm: '“{hope}” You fold the words away somewhere safe, and {them} sees you do it.',
        },
        warm: '“{hope}” {them} watches you take it in, and seems satisfied that you will.',
        cool: '“You say that now.” But {them.they} tell{them.s} you. “{hope}”',
      },
      {
        label: '“Nothing’s going to happen to you.”',
        tone: 'kind',
        reply: {
          blunt: '“Maybe you’re right. Then promise me you’ll look after yourself.” You promise.',
          warm: '“I hope you’re right. Then promise me you’ll look after yourself too.” You promise.',
        },
        warm: '{them} smiles. “Maybe you’re right. Then promise me you’ll look after yourself.” You promise, and {them.they} hold{them.s} you to it with a look.',
        cool: '“You don’t know that, and nor do I.”',
      },
      {
        label: '“Only if you promise me the same.”',
        tone: 'challenge',
        reply: {
          blunt: '“Deal,” {them} says, and then, more quietly, “{hope}”',
          warm: '“All right, I promise,” {them} says, and then, more quietly, “{hope}”',
        },
        warm: '“Deal,” {them} says, and you both pretend it was a small thing. “{hope}”',
        cool: '“I’m not trading with you.” {them} says it anyway, though. “{hope}”',
      },
    ],
  },
];
