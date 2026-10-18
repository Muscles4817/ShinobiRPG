import type { SenseiCoachingSpeech } from '../../senseiSpeech';

/**
 * What a sensei says after the weekly lesson and at the farewell (`senseiSpeech.ts`), as parts
 * the game puts together into one speech: each fact once, in their manner.
 */
export const SENSEI_COACHING: SenseiCoachingSpeech = {
  opening: [
    'After the lesson {name} keeps you back a moment.',
    '{name} sits down on a stump at the edge of {place} and waves you over.',
    'When the lesson is done, {name} walks a little way with you.',
  ],
  checked: {
    met: [
      '{name} looks over your {stat} before anything else.',
      'The first thing {name} checks is your {stat}.',
    ],
    missed: [
      '{name} checks your {stat}, and it isn’t where {name.they} wanted it.',
      '{name} looks over your {stat} and finds it short of the mark.',
    ],
  },
  verdicts: {
    met: {
      blunt: ['Good. That’s what I asked for.', 'That’ll do. That’s the work I wanted.'],
      warm: ['You did it. I knew you would.', 'Look at that. I’m proud of you, really.'],
      socratic: ['You did it. Now tell me how.', 'So it can be done. What made the difference?'],
      competitive: [
        'Nearly as quick as I was at your age. Nearly.',
        'Huh. I didn’t think you’d manage it this week.',
      ],
      cryptic: ['The stone remembers the river.', 'The seed did what seeds do.'],
    },
    missed: {
      blunt: [
        'Not enough, and you know it isn’t.',
        'That’s short. I don’t want to see short again.',
      ],
      warm: [
        'Not quite there yet. We’ll get it, though.',
        'It’s all right. Next week, with me watching.',
      ],
      socratic: ['What got in the way, do you think?', 'Where did the week go?'],
      competitive: [
        'That’s it? I expected more of a fight from you.',
        'I’d have been embarrassed by that, at your age.',
      ],
      cryptic: ['The river ran low this week.', 'You planted, and forgot to water.'],
    },
  },
  beaten: '{name.they} bring{name.s} up the job you went down on.',
  edge: ['Your {art} is the best thing you have', 'Nothing you do is as good as your {art}'],
  edgeAgain: 'It’s still the best thing you have',
  dangers: {
    evasion: 'you stand still too long, and anything quick will cut you down',
    guard: 'your guard is paper, and anyone who gets close will break it',
    will: 'anyone with an illusion walks straight through you',
    toughness: 'you can’t take a hit, and one good blow will finish you',
  },
  gift: 'there’s a gift in your {stat} you’ve never used',
  assign: {
    blunt: [
      'By the next lesson I want your {stat} better than this.',
      'Work on your {stat}. I’ll be checking.',
    ],
    warm: [
      'Give your {stat} some time this week, would you? I think you’ll surprise yourself.',
      'This week, your {stat}. I’ll help where I can.',
    ],
    socratic: [
      'Your {stat} is where I’d look next. Why, do you think?',
      'What would it take to bring your {stat} on by the next lesson?',
    ],
    competitive: [
      'Get your {stat} up by the next lesson. Let’s see if you can.',
      'Your {stat} is behind. Catch it up and impress me.',
    ],
    cryptic: [
      'Your {stat} is asleep. Wake it before we meet again.',
      'Listen to your {stat} this week. It has been trying to get your attention.',
    ],
  },
  assignMore: {
    blunt: ['I want more of it by the next lesson.', 'Keep at it. More by next time.'],
    warm: [
      'Let’s make it even better before the next lesson.',
      'Keep going with it, and I’ll be there to see it.',
    ],
    socratic: [
      'How far can it go, do you think? Show me next time.',
      'What would make it better still?',
    ],
    competitive: [
      'It isn’t near mine yet. Close the gap a little by next time.',
      'Mine was better at your age. Fix that.',
    ],
    cryptic: [
      'A blade you have is a blade to sharpen.',
      'The deeper the well, the further down the bucket goes.',
    ],
  },
  assignGift: 'Start on it this week, and by the next lesson we’ll both know what it can do.',
  farewell: {
    opening: [
      '{name} finds you after the ceremony, when the crowd has thinned, and stands beside you for a while without saying much.',
      'You find {name} waiting at the edge of the square once the ceremony is over, as if {name.they} had been there all along.',
    ],
    words: {
      blunt: [
        '“You’ll do. You always would have.”',
        '“I don’t say this often, so listen. You earned every bit of it.”',
      ],
      warm: [
        '“I’m so proud of you. Come and find me, often, or I’ll come and find you.”',
        '“Look at you. I knew it in the first week, you know, and I was right.”',
      ],
      socratic: [
        '“So. What will you teach, now that people will be following you?”',
        '“Do you remember what you thought a chūnin was, that first week? Were you right?”',
      ],
      competitive: [
        '“Now you’re almost worth beating properly. Almost.”',
        '“Don’t get comfortable. I want to see who in your year makes jōnin first.”',
      ],
      cryptic: [
        '“The river reaches the sea, and is still the river.”',
        '“The bell has rung, and the sound goes on after it.”',
      ],
    },
    gifts: {
      signature:
        'Before {name.they} go{name.es}, {name.they} show{name.s} you the last of {gift}, slowly, the way {name.they} showed you everything that first week.',
      gear: 'Before {name.they} go{name.es}, {name.they} press{name.es} {gift} into your hands and won’t hear a word about it.',
      recipe:
        'Before {name.they} go{name.es}, {name.they} write{name.s} out how to make {gift} for you, in a hand you have never seen {name.them} use.',
      meal: 'Then {name.they} take{name.s} you out to eat one more time, and won’t hear of you paying.',
      praise: 'For once {name.they} {name.does}n’t hurry off.',
    },
    catchphrase:
      '{name.they} say{name.s} one last time, and then {name.they} {name.is} gone into the crowd',
    closing: [
      'After that {name.they} {name.is} gone into the crowd, and the genin years go with {name.them}.',
      'At last {name.they} leave{name.s} you to the people waiting to congratulate you.',
    ],
  },
};
