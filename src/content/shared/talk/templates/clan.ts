import type { ConversationDef } from '../../../types';

/** Talk about someone’s clan, which only friends hear: its elders, its rites and its secrets. */
export const CLAN_TALK: readonly ConversationDef[] = [
  {
    id: 'talk-clan-2-elder',
    minStage: 2,
    about: 'clan',
    opener: '“Growing up, everything I did was weighed against {elder},” {them} says.',
    choices: [
      {
        label: '“Tell me about them.”',
        tone: 'curious',
        reply:
          '“They were stern with me, and fair, mostly. Even now I hear their voice when I train.”',
        warm: '“They were stern with me, and fair, mostly.” {them} does the voice, uncomfortably well. “Even now I hear it when I train.”',
        cool: '“They’re my family, there’s nothing to tell.”',
      },
      {
        label: '“Did you ever measure up?”',
        tone: 'tease',
        reply: '“Once, and nobody saw me do it.”',
        warm: '“Once, and nobody saw me do it.” {them} laughs at {them.themself}. “Typical, isn’t it?”',
        cool: '{them} doesn’t laugh. “I haven’t yet.”',
      },
      {
        label: '“That sounds like a lot to grow up under.”',
        tone: 'kind',
        reply: '“It was a lot, and you’re the first to say it.”',
        warm: '{them} looks at you, surprised. “You’re the first person who’s ever said that to me.”',
        cool: '“It was normal for our family.” {them} won’t have the clan pitied.',
      },
    ],
  },
  {
    id: 'talk-clan-2-rite',
    minStage: 2,
    about: 'clan',
    opener: '“Among {clan}, there’s a custom outsiders rarely see,” {them} says. “It’s {rite}.”',
    choices: [
      {
        label: '“What’s it like, from the inside?”',
        tone: 'curious',
        reply: '“Strange, the first time, and then it’s just home.”',
        warm: '{them} tells you about the first time, how cold it was and how long the waiting went on. “Now it feels like home to me.”',
        cool: '“It’s not for outsiders, that’s the point of it.”',
      },
      {
        label: '“Your family keeps the old ways well.”',
        tone: 'praise',
        reply: '“I’ll tell them you said so.”',
        warm: '“I’ll tell them you said so. They’ll be unbearable for a week after.”',
        cool: '“You’ve never seen them keep anything.”',
      },
      {
        label: '“Is there food involved?”',
        tone: 'joke',
        reply: '“There’s always food involved, with my family,” {them} says.',
        warm: '“With us there’s always food.” {them} describes it in more detail than you asked for, and you end up hungry.',
        cool: '“It’s not a festival, you know.”',
      },
    ],
  },
  {
    id: 'talk-clan-3-burden',
    minStage: 3,
    about: 'clan',
    opener:
      'Someone mentions {clan}, and {them} goes quiet. Later, {them.they} tell{them.s} you why. {burden}',
    choices: [
      {
        label: '“You’re more than your name.”',
        tone: 'kind',
        reply: '“Tell that to my family.”',
        warm: '“Tell that to my family.” But {them} looks grateful, and walks the long way home with you.',
        cool: '“Am I? You don’t know what the name is.”',
      },
      {
        label: '“What would you do, if you could choose?”',
        tone: 'earnest',
        reply: '{them} hesitates. “I don’t know. Nobody ever asked me.”',
        warm: '{them} hesitates for a long while. “I don’t know. Nobody ever asked me.” Then, slowly, {them.they} start{them.s} to wonder aloud.',
        cool: '“I can’t choose, so it doesn’t matter.”',
      },
      {
        label: 'Walk beside {them.them} in silence.',
        tone: 'quiet',
        reply: 'By the end of the street, {them} is breathing easier.',
        warm: 'By the end of the street {them} is breathing easier, and at the corner {them.they} thank{them.s} you without saying what for.',
        cool: 'By the end of the street {them} has walked on ahead.',
      },
    ],
  },
  {
    id: 'talk-clan-3-duty',
    minStage: 3,
    about: 'clan',
    opener:
      '“Every child of {clan} grows up knowing what’s expected, {duty},” {them} says. “I’m not sure I want it any more.”',
    choices: [
      {
        label: '“Then you don’t have to do it.”',
        tone: 'challenge',
        reply: '“It’s not that easy for us.”',
        warm: "“It’s not that easy for us.” But {them} sounds as if {them.they}{them.'s} thinking about it, and the thought doesn’t frighten {them.them} as much as it did.",
        cool: '“You don’t understand. You can’t just not.”',
      },
      {
        label: '“What would happen if you refused?”',
        tone: 'curious',
        reply: '“I’ve never dared find out.”',
        warm: '{them} laughs, without humour. “I’ve never dared find out. Maybe I should.”',
        cool: '“Nothing good would happen to me.”',
      },
      {
        label: '“Whatever you choose, I’ll back you.”',
        tone: 'kind',
        reply: '“You might be the only one.”',
        warm: '{them} lets out a long breath. “You might be the only one. That might be enough for me.”',
        cool: '“You say that like it’s simple.”',
      },
    ],
  },
  {
    id: 'talk-clan-4-secret',
    minStage: 4,
    about: 'clan',
    opener:
      '{them} checks that no one is near. “I shouldn’t tell anyone outside the family. But you’re not anyone.”',
    choices: [
      {
        label: '“It stays with me. I swear it.”',
        tone: 'earnest',
        reply: '{them} leans close. “{secret}”',
        warm: '{them} takes you at your word, and leans close. “{secret}”',
        cool: '“Don’t swear, just keep it for me.” {them} leans close. “{secret}”',
      },
      {
        label: 'Listen.',
        tone: 'quiet',
        reply: '“{secret}” {them} watches you take it in.',
        warm: '“{secret}” {them} watches you take it in, and seems glad you didn’t say anything clever.',
        cool: '“{secret}” {them} waits for you to say anything at all.',
      },
      {
        label: '“Is it a recipe?”',
        tone: 'tease',
        reply: '{them} snorts. Then, very quietly, “{secret}”',
        warm: '{them} snorts, and the nerves go out of it. Then, very quietly, “{secret}”',
        cool: '“I’m not joking.” Very quietly, almost against {them.their} will, “{secret}”',
      },
    ],
  },
  {
    id: 'talk-clan-4-family',
    minStage: 4,
    about: 'clan',
    opener: '{them} looks oddly shy. “I talked about you at home, to {elder}.”',
    choices: [
      {
        label: '“What did they say?”',
        tone: 'curious',
        reply: '“That you sound like family.”',
        warm: '“That you sound like family.” {them} studies the ground. “I agree.”',
        cool: '“Does it matter what they said? I said it.”',
      },
      {
        label: '“Did I pass?”',
        tone: 'joke',
        reply: '“You barely passed. You’re invited to dinner, so be afraid.”',
        warm: '“You barely passed,” {them} says, laughing. “You’re invited to dinner, so be very afraid.”',
        cool: '“It wasn’t a test of you.” {them} looks hurt that you’d think so.',
      },
      {
        label: '“I’m honoured.”',
        tone: 'earnest',
        reply: '“You should be. They don’t ask after many people, you know.”',
        warm: '“You should be.” {them} says it lightly, but means it. “They don’t ask after many people, you know.”',
        cool: '“Don’t make it formal, it’s only dinner with my family.”',
      },
    ],
  },
];
