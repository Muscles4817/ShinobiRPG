import type { ConversationDef } from '../../../types';

/** Talk about someone’s clan, which only friends hear: its elders, its rites and its secrets. */
export const CLAN_TALK: readonly ConversationDef[] = [
  {
    id: 'talk-clan-2-elder',
    minStage: 2,
    about: 'clan',
    opener: {
      blunt: '“Everything I did growing up got weighed against {elder},” {them} says.',
      warm: '“Growing up, everything I did was weighed against {elder},” {them} says, without any bitterness you can hear.',
      wry: '“Growing up, I had a rival,” {them} says. “It was {elder}. I never won once.”',
      formal:
        '“Throughout my childhood,” {them} says, “everything I did was measured against {elder}.”',
    },
    choices: [
      {
        label: '“Tell me about them.”',
        tone: 'curious',
        reply: {
          blunt:
            '“They were stern with me, and fair, mostly. Even now I hear their voice when I train.”',
          warm: '“They were stern with me, but fair, and they loved me in their way. Even now I hear their voice when I train.”',
        },
        warm: '“They were stern with me, and fair, mostly.” {them} does the voice, uncomfortably well. “Even now I hear it when I train.”',
        cool: '“They’re my family, there’s nothing to tell.”',
      },
      {
        label: '“Did you ever measure up?”',
        tone: 'tease',
        reply: {
          blunt: '“Once, and nobody saw me do it.”',
          warm: '“Once, I think, and of course nobody saw me do it.”',
        },
        warm: '“Once, and nobody saw me do it.” {them} laughs at {them.themself}. “Typical, isn’t it?”',
        cool: '{them} doesn’t laugh. “I haven’t yet.”',
      },
      {
        label: '“That sounds like a lot to grow up under.”',
        tone: 'kind',
        reply: {
          blunt: '“It was a lot, and you’re the first to say it.”',
          warm: '“It was. Thank you for seeing that. People usually don’t.”',
        },
        warm: '{them} looks at you, surprised. “You’re the first person who’s ever said that to me.”',
        cool: '“It was normal for our family.” {them} won’t have the clan pitied.',
      },
    ],
  },
  {
    id: 'talk-clan-2-rite',
    minStage: 2,
    about: 'clan',
    opener: {
      blunt: '“{clan} have a custom outsiders don’t get to see,” {them} says. “It’s {rite}.”',
      warm: '“Can I tell you about a custom we keep?” {them} says. “Among {clan}, it’s {rite}. Outsiders hardly ever see it.”',
      wry: '“Want to hear the oddest thing about {clan}?” {them} says. “It’s {rite}. Outsiders never see it, which is probably for the best.”',
      formal:
        '“Among {clan} there is a custom that outsiders rarely see,” {them} says. “It is {rite}.”',
    },
    choices: [
      {
        label: '“What’s it like, from the inside?”',
        tone: 'curious',
        reply: {
          blunt: '“Strange, the first time, and then it’s just home.”',
          warm: '“It felt strange the first time. Now it just feels like home.”',
        },
        warm: '{them} tells you about the first time, how cold it was and how long the waiting went on. “Now it feels like home to me.”',
        cool: '“It’s not for outsiders, that’s the point of it.”',
      },
      {
        label: '“Your family keeps the old ways well.”',
        tone: 'praise',
        reply: {
          blunt: '“I’ll tell them you said so.”',
          warm: '“I’ll tell them you said so. They’ll be so pleased.”',
        },
        warm: '“I’ll tell them you said so. They’ll be unbearable for a week after.”',
        cool: '“You’ve never seen them keep anything.”',
      },
      {
        label: '“Is there food involved?”',
        tone: 'joke',
        reply: {
          blunt: '“There’s always food involved, with my family,” {them} says.',
          warm: '“Of course there’s food. With my family there always is,” {them} says.',
        },
        warm: '“With us there’s always food.” {them} describes it in more detail than you asked for, and you end up hungry.',
        cool: '“It’s not a festival, you know.”',
      },
    ],
  },
  {
    id: 'talk-clan-3-burden',
    minStage: 3,
    about: 'clan',
    opener: {
      blunt:
        'Someone mentions {clan}, and {them} shuts up for the rest of the walk. Later {them.they} tell{them.s} you why. {burden}',
      warm: 'Someone mentions {clan}, and {them} goes quiet. Later, when it’s only the two of you, {them.they} tell{them.s} you why. {burden}',
      wry: 'Someone mentions {clan}, and {them} makes a joke too fast. Later {them.they} tell{them.s} you why. {burden}',
      formal:
        'Someone mentions {clan}, and {them} falls silent. Later, {them.they} explain{them.s}. {burden}',
    },
    choices: [
      {
        label: '“You’re more than your name.”',
        tone: 'kind',
        reply: {
          blunt: '“Tell that to my family.”',
          warm: '“I wish my family saw it that way. But thank you.”',
        },
        warm: '“Tell that to my family.” But {them} looks grateful, and walks the long way home with you.',
        cool: '“Am I? You don’t know what the name is.”',
      },
      {
        label: '“What would you do, if you could choose?”',
        tone: 'earnest',
        reply: {
          blunt: '{them} hesitates. “I don’t know, because nobody ever asked me.”',
          warm: '{them} hesitates. “I don’t know, because nobody’s ever asked me that, not once.”',
        },
        warm: '{them} hesitates for a long while. “I don’t know. Nobody has ever asked me that before.” Then, slowly, {them.they} start{them.s} to wonder aloud.',
        cool: '“I can’t choose, so it doesn’t matter.”',
      },
      {
        label: 'Walk beside {them.them} in silence.',
        tone: 'quiet',
        reply: {
          blunt: 'By the end of the street, {them} is breathing easier.',
          warm: 'By the end of the street {them} is breathing easier, and slows to match your pace.',
        },
        warm: 'By the end of the street {them} is breathing easier, and at the corner {them.they} thank{them.s} you without saying what for.',
        cool: 'By the end of the street {them} has walked on ahead.',
      },
    ],
  },
  {
    id: 'talk-clan-3-duty',
    minStage: 3,
    about: 'clan',
    opener: {
      blunt:
        '“Every child of {clan} knows what’s expected, {duty},” {them} says. “I’m not sure I want it.”',
      warm: '“Every child of {clan} grows up knowing what’s expected, {duty},” {them} says. “And I’m not sure I want it any more. Is that terrible?”',
      wry: '“{clan} have a plan for every child, {duty},” {them} says. “Lovely plan. I’m not sure it’s mine.”',
      formal:
        '“Every child of {clan} is raised to a duty, {duty},” {them} says. “I am no longer certain that I want it.”',
    },
    choices: [
      {
        label: '“Then you don’t have to do it.”',
        tone: 'challenge',
        reply: {
          blunt: '“It’s not that easy for us.”',
          warm: '“I wish it were that easy for us.”',
        },
        warm: "“It’s not that easy for us.” But {them} sounds as if {them.they}{them.'s} thinking about it, and the thought doesn’t frighten {them.them} as much as it did.",
        cool: '“You don’t understand. You can’t just not.”',
      },
      {
        label: '“What would happen if you refused?”',
        tone: 'curious',
        reply: {
          blunt: '“I’ve never dared find out.”',
          warm: '“I don’t know, because I’ve never dared to find out.”',
        },
        warm: '{them} laughs, without humour. “I’ve never dared find out. Maybe I should.”',
        cool: '“Nothing good would happen to me.”',
      },
      {
        label: '“Whatever you choose, I’ll back you.”',
        tone: 'kind',
        reply: {
          blunt: '“You might be the only one.”',
          warm: '“You might be the only one who does, and thank you.”',
        },
        warm: '{them} lets out a long breath. “You might be the only one. That might be enough for me.”',
        cool: '“You say that like it’s simple.”',
      },
    ],
  },
  {
    id: 'talk-clan-4-secret',
    minStage: 4,
    about: 'clan',
    opener: {
      blunt:
        '{them} checks nobody’s near. “I’m not meant to tell anyone outside the family. I’m telling you.”',
      warm: '{them} checks that no one is near. “I shouldn’t tell anyone outside the family. But you’re not anyone, are you?”',
      wry: '{them} checks that no one is near, twice. “I’m about to break a family rule. If anyone asks, you overheard it from a cat.”',
      formal:
        '{them} makes sure that no one is near. “This is not to be shared outside the family. I am choosing to share it with you.”',
    },
    choices: [
      {
        label: '“It stays with me. I swear it.”',
        tone: 'earnest',
        reply: {
          blunt: '{them} leans close, so nobody else will hear. “{secret}”',
          warm: '{them} believes you, and leans close. “{secret}”',
        },
        warm: '{them} takes you at your word, and leans close. “{secret}”',
        cool: '“Don’t swear, just keep it for me.” {them} leans close, so nobody else will hear. “{secret}”',
      },
      {
        label: 'Listen.',
        tone: 'quiet',
        reply: {
          blunt: '“{secret}” {them} watches you take it in.',
          warm: '“{secret}” {them} watches you take it in, anxious and relieved at once.',
        },
        warm: '“{secret}” {them} watches you take it in, and seems glad you didn’t say anything clever.',
        cool: '“{secret}” {them} waits for you to say anything at all.',
      },
      {
        label: '“Is it a recipe?”',
        tone: 'tease',
        reply: {
          blunt: '{them} snorts, and then, very quietly, “{secret}”',
          warm: '{them} laughs under {them.their} breath. Then, very quietly, “{secret}”',
        },
        warm: '{them} snorts, and the nerves go out of it. Then, very quietly, “{secret}”',
        cool: '“I’m not joking.” Very quietly, almost against {them.their} will, “{secret}”',
      },
    ],
  },
  {
    id: 'talk-clan-4-family',
    minStage: 4,
    about: 'clan',
    opener: {
      blunt: '“I told them about you at home,” {them} says. “{elder} too.”',
      warm: '{them} looks oddly shy. “I talked about you at home, to {elder}. I hope you don’t mind.”',
      wry: '“Bad news,” {them} says. “I talked about you at home, to {elder}. Now they want to meet you.”',
      formal: '{them} seems almost shy. “I spoke of you at home, to {elder}.”',
    },
    choices: [
      {
        label: '“What did they say?”',
        tone: 'curious',
        reply: {
          blunt: '“That you sound like family.”',
          warm: '“That you sound like family. I think so too.”',
        },
        warm: '“That you sound like family.” {them} studies the ground. “I agree.”',
        cool: '“Does it matter what they said? I said it.”',
      },
      {
        label: '“Did I pass?”',
        tone: 'joke',
        reply: {
          blunt: '“You barely passed. You’re invited to dinner, so be afraid.”',
          warm: '“You did, though only just. You’re invited to dinner, so be a little afraid.”',
        },
        warm: '“You barely passed,” {them} says, laughing. “You’re invited to dinner, so be very afraid.”',
        cool: '“It wasn’t a test of you.” {them} looks hurt that you’d think so.',
      },
      {
        label: '“I’m honoured.”',
        tone: 'earnest',
        reply: {
          blunt: '“You should be. They don’t ask after many people, you know.”',
          warm: '“You should be, a little. They don’t ask after many people.”',
        },
        warm: '“You should be.” {them} says it lightly, but means it. “They don’t ask after many people, you know.”',
        cool: '“Don’t make it formal, it’s only dinner with my family.”',
      },
    ],
  },
];
