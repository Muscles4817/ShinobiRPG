import type { ConversationDef } from '../../types';

/** Things only particular people say. Mixed in with the generic small talk. */
export const NARUTO_CONVERSATIONS: readonly ConversationDef[] = [
  {
    id: 'naruto-ramen',
    personId: 'naruto',
    minStage: 0,
    opener: '"Hey! You’re {you}, right? Wanna get ramen? I’m buying! …Actually, can you buy?"',
    choices: [
      {
        label: '“Only if you can keep up with me.”',
        tone: 'challenge',
        reply: '"Believe it!" Naruto is already running.',
      },
      {
        label: '“Sure. My treat.”',
        tone: 'kind',
        reply: 'Naruto looks at you like you just hung the moon.',
      },
      {
        label: '“Do you eat anything else?”',
        tone: 'tease',
        reply: '"Ramen has vegetables in it," he says, wounded.',
      },
    ],
  },
  {
    id: 'naruto-hokage',
    personId: 'naruto',
    minStage: 2,
    opener: '"Everybody laughs when I say I’ll be Hokage," Naruto says. "You don’t."',
    choices: [
      {
        label: '“Because I believe you.”',
        tone: 'earnest',
        reply: 'Naruto goes quiet. Then he grins so wide it looks painful.',
      },
      {
        label: '“Because I’m going to beat you to it.”',
        tone: 'challenge',
        reply: '"Ha! Bring it on, then!"',
      },
      {
        label: '“Because you’d never shut up about it if I did.”',
        tone: 'joke',
        reply: 'He laughs so hard he falls off the bench.',
      },
    ],
  },
  {
    id: 'sasuke-train',
    personId: 'sasuke',
    minStage: 0,
    opener: 'Sasuke glances at you, then back at the target post. "What."',
    choices: [
      {
        label: '“Spar with me.”',
        tone: 'challenge',
        reply: '"Hn." He drops into a stance. That is a yes.',
      },
      {
        label: '“That was a good throw.”',
        tone: 'praise',
        reply: '"I know," he says. He does not throw again until you leave.',
      },
      {
        label: 'Start training beside him without a word.',
        tone: 'quiet',
        reply: 'Neither of you speaks for an hour. It is not uncomfortable.',
      },
    ],
  },
  {
    id: 'sakura-study',
    personId: 'sakura',
    minStage: 0,
    opener:
      'Sakura is surrounded by scrolls. "Did you know chakra control matters more than reserves?"',
    choices: [
      {
        label: '“Explain it to me?”',
        tone: 'curious',
        reply: 'She lights up and explains. It actually helps.',
      },
      {
        label: '“You’re the smartest one in our year.”',
        tone: 'praise',
        reply: '"I— well— thank you," she says, and turns pink.',
      },
      {
        label: '“Bet you can’t punch harder than me, though.”',
        tone: 'challenge',
        reply: 'Something dangerous flickers in her eyes. "Bet I can."',
      },
    ],
  },
  {
    id: 'hinata-shy',
    personId: 'hinata',
    minStage: 0,
    opener: 'Hinata startles when she sees you. "O-oh. Good morning, {you}."',
    choices: [
      {
        label: '“Good morning! Training too?”',
        tone: 'kind',
        reply: 'She nods, and smiles a little more easily.',
      },
      {
        label: '“Your gentle fist is really something.”',
        tone: 'praise',
        reply: 'She looks at her hands, surprised anyone noticed.',
      },
      {
        label: '“Why so jumpy?”',
        tone: 'tease',
        reply: 'Hinata shrinks a little and finds a reason to leave.',
      },
    ],
  },
  {
    id: 'shikamaru-clouds',
    personId: 'shikamaru',
    minStage: 0,
    opener:
      'Shikamaru is lying on his back watching clouds. "Troublesome. Are you going to make me get up?"',
    choices: [
      {
        label: 'Lie down next to him.',
        tone: 'quiet',
        reply: '"Huh. You get it." He points out a cloud shaped like a deer.',
      },
      {
        label: '“Play me at shōgi.”',
        tone: 'challenge',
        reply: 'He sighs, sits up, and beats you in eleven moves.',
      },
      {
        label: '“You could be a genius if you tried.”',
        tone: 'earnest',
        reply: '"That sounds like a lot of effort," he says.',
      },
    ],
  },
  {
    id: 'lee-youth',
    personId: 'lee',
    minStage: 0,
    opener:
      '"{you}! Your flames of youth burn brightly today! Will you run five hundred laps with me?"',
    choices: [
      {
        label: '“Make it six hundred.”',
        tone: 'challenge',
        reply: 'Lee weeps with joy. You regret this by lap ninety.',
      },
      {
        label: '“Your dedication is amazing, Lee.”',
        tone: 'praise',
        reply: '"Guy-sensei says hard work beats genius!" He salutes.',
      },
      {
        label: '“Five hundred? That’s insane.”',
        tone: 'joke',
        reply: '"Then I shall run a thousand!" He is gone in a cloud of dust.',
      },
    ],
  },
  {
    id: 'iruka-ramen',
    personId: 'iruka',
    minStage: 0,
    opener: 'Iruka spots you and smiles. "Look at you, a real shinobi. Hungry?"',
    choices: [
      {
        label: '“Thank you, Iruka-sensei. For everything.”',
        tone: 'earnest',
        reply: 'He scratches the scar on his nose and looks away, moved.',
      },
      {
        label: '“Are you paying again?”',
        tone: 'tease',
        reply: '"Apparently I always am," he laughs.',
      },
      {
        label: '“How did you know I’d be hungry?”',
        tone: 'curious',
        reply: '"Every genin is hungry," he says. "That’s how I know."',
      },
    ],
  },
  {
    id: 'kakashi-book',
    personId: 'kakashi',
    minStage: 0,
    opener: 'Kakashi does not look up from his little orange book. "Yo."',
    choices: [
      {
        label: '“What are you reading?”',
        tone: 'curious',
        reply: '"Literature," he says, and turns a page. You are not convinced.',
      },
      {
        label: '“Teach me something.”',
        tone: 'challenge',
        reply: 'He looks up for exactly one second. "Maybe. If you’re still here tomorrow."',
      },
      {
        label: 'Sit nearby and wait.',
        tone: 'quiet',
        reply: 'Eventually he closes the book. "Patient. That’s rarer than talent."',
      },
    ],
  },
  {
    id: 'guy-rival',
    personId: 'guy',
    minStage: 0,
    opener: '"YOUNG {you}!" Might Guy strikes a pose. "Do you seek the path of hard work?"',
    choices: [
      {
        label: '“I do!” (Strike the same pose.)',
        tone: 'earnest',
        reply: 'Guy’s eyes fill with tears. A sunset appears from nowhere.',
      },
      {
        label: '“Race me to the gate.”',
        tone: 'challenge',
        reply: 'He wins. Doing a handstand. He offers you a rematch.',
      },
      {
        label: '“Is that jumpsuit comfortable?”',
        tone: 'curious',
        reply: '"Incredibly!" he says, and offers to find you one.',
      },
    ],
  },
  {
    id: 'hiruzen-pipe',
    personId: 'hiruzen',
    minStage: 0,
    opener:
      'The Hokage puffs on his pipe. "Ah. One of this year’s graduates. How do you find the life of a shinobi?"',
    choices: [
      {
        label: '“Hard. But I want to protect the village.”',
        tone: 'earnest',
        reply: '"Then you already understand the Will of Fire," he says.',
      },
      {
        label: '“I’ll have your hat one day.”',
        tone: 'challenge',
        reply: 'He laughs until he coughs. "I look forward to it."',
      },
      {
        label: '“Lord Hokage, what was it like for you?”',
        tone: 'curious',
        reply: 'He tells you a story about his own sensei. It takes all morning.',
      },
    ],
  },
];
