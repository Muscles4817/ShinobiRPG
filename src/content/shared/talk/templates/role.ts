import type { ConversationDef } from '../../../types';

/** Talk about what someone does all day, and what it asks of them. */
export const ROLE_TALK: readonly ConversationDef[] = [
  {
    id: 'talk-role-0-busy',
    minStage: 0,
    about: 'role',
    opener: '{them} barely looks up. “Sorry. Busy. It’s always the same: {work}.”',
    choices: [
      {
        label: '“I’ll leave you to it.”',
        tone: 'kind',
        reply: '“Thanks.” {them} sounds like {them.they} mean{them.s} it.',
      },
      {
        label: '“Need a hand?”',
        tone: 'earnest',
        reply: '{them} looks up properly this time. “Maybe another day. But thank you.”',
      },
      {
        label: '“You could stand to slow down.”',
        tone: 'tease',
        reply: '“Could I?” {them} doesn’t slow down.',
      },
    ],
  },
  {
    id: 'talk-role-1-days',
    minStage: 1,
    about: 'role',
    opener: '{them} stretches until something clicks. “Most days are the same: {work}.”',
    choices: [
      {
        label: '“Do you like it?”',
        tone: 'curious',
        reply: '“Most of it. Ask me again at the end of the week.”',
      },
      {
        label: '“Sounds thrilling.”',
        tone: 'joke',
        reply: '“You have no idea,” {them} says, perfectly straight-faced.',
      },
      {
        label: '“Someone has to, and you do it well.”',
        tone: 'praise',
        reply: '{them} looks pleased despite {them.themself}.',
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
        reply: '“Exactly. You get it.”',
      },
      {
        label: '“So you’re saying it’s easy.”',
        tone: 'tease',
        reply: '“I’m saying it’s every day.” {them} gives you a look. “Try it.”',
      },
      {
        label: '“And the other half?”',
        tone: 'curious',
        reply: '“The other half? It’s {work}, mostly.”',
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
      },
      {
        label: '“And now you really do?”',
        tone: 'tease',
        reply: '“Now I know how little I know.” Then {them} tells you anyway. {memory}',
      },
      {
        label: '“Everyone starts somewhere.”',
        tone: 'kind',
        reply: '{them} nods, and tells you where {them.they} started. {memory}',
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
        reply: '“Someone patient. More patient than I deserved.”',
      },
      {
        label: '“Was it as bad as that?”',
        tone: 'joke',
        reply: '“Worse.” {them} laughs, and tells you. {memory}',
      },
      {
        label: '“Tell them it gets easier.”',
        tone: 'earnest',
        reply:
          '“It doesn’t,” {them} says. “You just get better.” Then {them.they} go{them.es} over to help.',
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
        reply: '“You already do,” {them} says, and means it.',
      },
      {
        label: '“Does anyone else know?”',
        tone: 'earnest',
        reply: '“No. And I’d like to keep it that way.”',
      },
      {
        label: 'Sit with {them.them} a while.',
        tone: 'quiet',
        reply: 'The quiet does {them.them} good. You can see it.',
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
      },
      {
        label: '“Then stop for a day. See how it feels.”',
        tone: 'challenge',
        reply: '“I tried once. I lasted a morning.” {them} smiles ruefully.',
      },
      {
        label: '“Because you’re good at it, and people need you.”',
        tone: 'kind',
        reply: '{them} lets that land. “Thank you. I needed to hear that today.”',
      },
    ],
  },
  {
    id: 'talk-role-4-hope',
    minStage: 4,
    about: 'role',
    opener: '{them} looks at you for a long moment. “Can I tell you what I hope for you?”',
    choices: [
      {
        label: '“Please.”',
        tone: 'earnest',
        reply: '“{hope}” {them.they} say{them.s} it like a promise.',
      },
      {
        label: '“That I stop eating your food?”',
        tone: 'tease',
        reply: '“That too.” Then, seriously: “{hope}”',
      },
      {
        label: 'Nod.',
        tone: 'quiet',
        reply: '“{hope}” {them} squeezes your shoulder.',
      },
    ],
  },
  {
    id: 'talk-role-4-remember',
    minStage: 4,
    about: 'role',
    opener: '“Whatever happens to me,” {them} says, “I want you to remember something.”',
    choices: [
      {
        label: '“I’ll remember.”',
        tone: 'earnest',
        reply: '“{hope}” You fold the words away somewhere safe.',
      },
      {
        label: '“Nothing’s going to happen to you.”',
        tone: 'kind',
        reply:
          '{them} smiles. “Maybe not. Then promise me you’ll look after yourself.” You promise.',
      },
      {
        label: '“Only if you promise me the same.”',
        tone: 'challenge',
        reply: '“Deal,” {them} says, and you both pretend it was a small thing.',
      },
    ],
  },
];
