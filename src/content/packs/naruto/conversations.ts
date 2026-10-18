import type { ConversationDef } from '../../types';

/** Things only particular people say. Mixed in with the generic small talk. */
export const NARUTO_CONVERSATIONS: readonly ConversationDef[] = [
  {
    id: 'naruto-ramen',
    personId: 'naruto',
    minStage: 0,
    opener:
      '“Hey! You’re {you}, right? Wanna get ramen? I’m buying! …Actually, wait, can you buy?”',
    choices: [
      {
        label: '“Only if you can keep up with me.”',
        tone: 'challenge',
        reply:
          '“Believe it!” Naruto is already running, and shouting the way to Ichiraku over his shoulder.',
      },
      {
        label: '“Sure. My treat.”',
        tone: 'kind',
        reply:
          'Naruto looks at you as if you’d just hung the moon, and orders the biggest bowl on the board before you can change your mind.',
      },
      {
        label: '“Do you eat anything else?”',
        tone: 'tease',
        reply: '“Ramen has vegetables in it, you know,” he says, deeply wounded.',
      },
    ],
  },
  {
    id: 'naruto-hokage',
    personId: 'naruto',
    minStage: 2,
    opener:
      '“Everybody laughs when I say I’m gonna be Hokage,” Naruto says, kicking at the dirt. “You never do. How come?”',
    choices: [
      {
        label: '“Because I believe you.”',
        tone: 'earnest',
        reply:
          'Naruto goes quiet, which hardly ever happens, and then his whole face breaks into a smile so wide it looks like it hurts.',
      },
      {
        label: '“Because I’m going to beat you to it.”',
        tone: 'challenge',
        reply: '“Ha! Then bring it on, ’cause I’m not slowing down for you!”',
      },
      {
        label: '“Because you’d never shut up about it if I did.”',
        tone: 'joke',
        reply:
          'He laughs so hard he falls backwards off the bench, and keeps laughing from the ground.',
      },
    ],
  },
  {
    id: 'sasuke-train',
    personId: 'sasuke',
    minStage: 0,
    opener: 'Sasuke glances at you, then back at the target post. “What do you want?”',
    choices: [
      {
        label: '“Spar with me.”',
        tone: 'challenge',
        reply: '“Hn.” He drops into a stance, which is as close to a yes as Sasuke gets.',
      },
      {
        label: '“That was a good throw.”',
        tone: 'praise',
        reply: '“I know,” he says, and doesn’t throw again until you’ve gone.',
      },
      {
        label: 'Start training beside him without a word.',
        tone: 'quiet',
        reply:
          'Neither of you speaks for an hour, and when you finally stop he’s still there, a few posts down, matching your pace.',
      },
    ],
  },
  {
    id: 'sakura-study',
    personId: 'sakura',
    minStage: 0,
    opener:
      'Sakura is surrounded by open scrolls. “Did you know chakra control matters more than reserves? Nobody in our class believes me.”',
    choices: [
      {
        label: '“Will you explain it to me?”',
        tone: 'curious',
        reply:
          'She lights up and explains it with diagrams drawn in the dirt, and to your surprise it actually helps.',
      },
      {
        label: '“You’re the smartest one in our year.”',
        tone: 'praise',
        reply: '“I— well— thank you,” she says, turning pink to the ears.',
      },
      {
        label: '“Bet you can’t punch harder than me, though.”',
        tone: 'challenge',
        reply: 'Her eyes narrow dangerously. “Bet I can. Hold still.”',
      },
    ],
  },
  {
    id: 'hinata-shy',
    personId: 'hinata',
    minStage: 0,
    opener: 'Hinata startles when she sees you. “O-oh. Good morning, {you}.”',
    choices: [
      {
        label: '“Good morning! Training too?”',
        tone: 'kind',
        reply: '“Y-yes. Father wants me ready,” she says, and smiles a little more easily.',
      },
      {
        label: '“Your gentle fist is really impressive.”',
        tone: 'praise',
        reply: 'She looks down at her hands, surprised that anyone noticed them at all.',
      },
      {
        label: '“Why so jumpy?”',
        tone: 'tease',
        reply: 'Hinata shrinks a little, and soon finds a reason she has to be somewhere else.',
      },
    ],
  },
  {
    id: 'shikamaru-clouds',
    personId: 'shikamaru',
    minStage: 0,
    opener:
      'Shikamaru is lying on his back watching clouds. “What a drag. Are you going to make me get up?”',
    choices: [
      {
        label: 'Lie down next to him.',
        tone: 'quiet',
        reply: '“Huh. You get it.” After a while he points out a cloud shaped like a deer.',
      },
      {
        label: '“Play me at shōgi.”',
        tone: 'challenge',
        reply:
          'He groans and sits up, then beats you in eleven moves without seeming to look at the board.',
      },
      {
        label: '“You could be a genius if you tried.”',
        tone: 'earnest',
        reply: '“That sounds like a lot of effort,” he says to the clouds.',
      },
    ],
  },
  {
    id: 'lee-youth',
    personId: 'lee',
    minStage: 0,
    opener:
      '“{you}! Your flames of youth burn brightly today! Will you run five hundred laps with me?”',
    choices: [
      {
        label: '“Make it six hundred.”',
        tone: 'challenge',
        reply: 'Lee weeps with joy, and by lap ninety you are deeply sorry you said it.',
      },
      {
        label: '“Your dedication is amazing, Lee.”',
        tone: 'praise',
        reply: '“Guy-sensei says hard work beats genius!” He salutes you with his whole arm.',
      },
      {
        label: '“Five hundred? That’s insane.”',
        tone: 'joke',
        reply: '“Then I shall run a thousand!” He is gone in a cloud of dust before you can argue.',
      },
    ],
  },
  {
    id: 'iruka-ramen',
    personId: 'iruka',
    minStage: 0,
    opener: 'Iruka spots you and smiles. “Look at you, a real shinobi now. Are you hungry?”',
    choices: [
      {
        label: '“Thank you, Iruka-sensei. For everything.”',
        tone: 'earnest',
        reply:
          'He scratches the scar across his nose and looks away, more moved than he wants you to see.',
      },
      {
        label: '“Are you paying again?”',
        tone: 'tease',
        reply: '“Apparently I always am,” he laughs.',
      },
      {
        label: '“How did you know I’d be hungry?”',
        tone: 'curious',
        reply: '“Every genin I’ve ever taught was hungry,” he says. “You’re no different.”',
      },
    ],
  },
  {
    id: 'kakashi-book',
    personId: 'kakashi',
    minStage: 0,
    opener: 'Kakashi doesn’t look up from his little orange book. “Yo.”',
    choices: [
      {
        label: '“What are you reading?”',
        tone: 'curious',
        reply: '“Literature,” he says, and turns a page, and you are not convinced.',
      },
      {
        label: '“Teach me something.”',
        tone: 'challenge',
        reply: 'He looks up for exactly one second. “Maybe. If you’re still here tomorrow.”',
      },
      {
        label: 'Sit nearby and wait.',
        tone: 'quiet',
        reply:
          'Eventually he closes the book. “You’re patient, I’ll give you that. It’s rarer than talent, in my experience.”',
        favour: 'kakashi-patience',
      },
    ],
  },
  {
    id: 'guy-rival',
    personId: 'guy',
    minStage: 0,
    opener: '“YOUNG {you}!” Might Guy strikes a pose. “Do you seek the path of hard work?”',
    choices: [
      {
        label: '“I do!” (Strike the same pose.)',
        tone: 'earnest',
        reply:
          'Guy’s eyes fill with tears, and somehow, though it’s noon, there is a sunset behind him.',
      },
      {
        label: '“Race me to the gate.”',
        tone: 'challenge',
        reply:
          'He wins walking on his hands the whole way, then offers you a rematch before you’ve caught your breath.',
      },
      {
        label: '“Is that jumpsuit comfortable?”',
        tone: 'curious',
        reply: '“Incredibly!” he says, and offers to find you one in your size.',
      },
    ],
  },
  {
    id: 'hiruzen-pipe',
    personId: 'hiruzen',
    minStage: 0,
    opener:
      'The Hokage puffs on his pipe. “Ah, one of this year’s graduates. How are you finding the life of a shinobi?”',
    choices: [
      {
        label: '“Hard. But I want to protect the village.”',
        tone: 'earnest',
        reply: '“Then you already understand the Will of Fire better than many,” he says.',
      },
      {
        label: '“I’ll have your hat one day.”',
        tone: 'challenge',
        reply: 'He laughs until he coughs. “I look forward to it. It’s heavier than it looks.”',
      },
      {
        label: '“Lord Hokage, what was it like for you?”',
        tone: 'curious',
        reply:
          'He tells you a story about his own sensei, and it takes the whole morning, and you don’t mind.',
      },
    ],
  },
];
