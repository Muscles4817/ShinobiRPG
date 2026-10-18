import type { VoiceDef } from '../../voices';

/**
 * What the crew say when a decision lands well or badly with them, and by the fire. Shared by
 * every pack; each trait in its own way of talking.
 */
export const CHOICE_VOICES: readonly VoiceDef[] = [
  {
    moment: 'approve',
    trait: 'brash',
    lines: ['Now we’re talking. I was getting bored.', 'Finally, something with some teeth in it.'],
  },
  {
    moment: 'disapprove',
    trait: 'brash',
    lines: [
      'We’re creeping about like mice, and for what?',
      'That was the boring way, you know that, right?',
    ],
  },
  {
    moment: 'camp',
    trait: 'brash',
    lines: [
      'Tomorrow I’m going first, and don’t bother arguing.',
      'One day someone will write a song about this road. About me, mostly.',
    ],
  },
  {
    moment: 'approve',
    trait: 'calm',
    lines: ['That was well judged. I’d have done the same.', 'Good. There was no need to rush it.'],
  },
  {
    moment: 'disapprove',
    trait: 'calm',
    lines: [
      'That was hasty. I think there was a quieter way.',
      'I’d have waited a little longer, myself.',
    ],
  },
  {
    moment: 'camp',
    trait: 'calm',
    lines: [
      'Listen. You can hear the river from here if everyone stops talking.',
      'Go to sleep. I’ll keep the fire going for a while.',
    ],
  },
  {
    moment: 'approve',
    trait: 'diligent',
    lines: ['That’s the job done right, by the book.', 'Agreed. Let’s get on with it, then.'],
  },
  {
    moment: 'disapprove',
    trait: 'diligent',
    lines: [
      'That isn’t what we were sent here to do.',
      'We’re cutting corners, and it will show in the report.',
    ],
  },
  {
    moment: 'camp',
    trait: 'diligent',
    lines: [
      'I’ve checked the map twice and we’re on time, if anyone was wondering.',
      'I’ll oil the blades before I sleep. Hand me yours.',
    ],
  },
  {
    moment: 'approve',
    trait: 'lazy',
    lines: ['The easy way. I knew you had it in you.', 'Very sensible. I like sensible.'],
  },
  {
    moment: 'disapprove',
    trait: 'lazy',
    lines: [
      'That sounds like a lot of effort, for the record.',
      'Why do we always pick the hard way? Just once I’d like to know.',
    ],
  },
  {
    moment: 'camp',
    trait: 'lazy',
    lines: [
      'This is the best part of any job, the sitting down.',
      'Wake me if anything’s on fire. Anything besides the fire, I mean.',
    ],
  },
  {
    moment: 'approve',
    trait: 'kind',
    lines: [
      'Thank you for that. I was hoping you would.',
      'That was the right thing, I’m sure of it.',
    ],
  },
  {
    moment: 'disapprove',
    trait: 'kind',
    lines: ['That felt cold to me.', 'Couldn’t we have helped them, even a little?'],
  },
  {
    moment: 'camp',
    trait: 'kind',
    lines: [
      'Here, take my blanket, I always run warm at night.',
      'I hope everyone back home is eating properly while we’re gone.',
    ],
  },
  {
    moment: 'approve',
    trait: 'cunning',
    lines: ['Clever. I think I like you more already.', 'That will pay off later, you watch.'],
  },
  {
    moment: 'disapprove',
    trait: 'cunning',
    lines: ['You played every card face up there, you know.', 'Honest. How very honest of you.'],
  },
  {
    moment: 'camp',
    trait: 'cunning',
    lines: [
      'Did you see the client’s face when we asked about the road? I keep thinking about it.',
      'Everyone tells a lie or two by a fire. Go on, it’s your turn.',
    ],
  },
  {
    moment: 'approve',
    trait: 'proud',
    lines: [
      'At last, a decision worthy of us.',
      'Good. If we’re doing it, we do it properly and in the open.',
    ],
  },
  {
    moment: 'disapprove',
    trait: 'proud',
    lines: ['That was beneath us.', 'Is that really the best our village can do?'],
  },
  {
    moment: 'camp',
    trait: 'proud',
    lines: [
      'My family walked this road before the village had walls around it.',
      'I’ll take the late watch. Somebody reliable should.',
    ],
  },
  {
    moment: 'approve',
    trait: 'humble',
    lines: ['I think that was right. I hope so.', 'Yes, I’d have chosen that too, if I’d dared.'],
  },
  {
    moment: 'disapprove',
    trait: 'humble',
    lines: ['I’m not sure about that, but you know best.', 'If you think so…'],
  },
  {
    moment: 'camp',
    trait: 'humble',
    lines: [
      'I’m glad I’m out here with you all, really.',
      'Would you teach me that thing you did today? Only if you have time.',
    ],
  },
  {
    moment: 'approve',
    trait: 'curious',
    lines: ['Oh, good, let’s see what happens.', 'I was hoping you’d pick that one.'],
  },
  {
    moment: 'disapprove',
    trait: 'curious',
    lines: [
      'But now we’ll never find out what would have happened.',
      'Oh. I really wanted to see the other way.',
    ],
  },
  {
    moment: 'camp',
    trait: 'curious',
    lines: [
      'Do you think the stars look different from other villages?',
      'What’s the strangest job anyone here has ever heard of?',
    ],
  },
  {
    moment: 'approve',
    trait: 'focused',
    lines: ['Right call. Let’s keep moving.', 'Agreed, that keeps us on the job.'],
  },
  {
    moment: 'disapprove',
    trait: 'focused',
    lines: ['That’s a distraction from what we came for.', 'It isn’t the job. Remember the job.'],
  },
  {
    moment: 'camp',
    trait: 'focused',
    lines: [
      'First watch is mine, so get some sleep.',
      'The road narrows tomorrow, past the ridge. Be ready for it.',
    ],
  },
  {
    moment: 'approve',
    trait: 'tireless',
    lines: ['Yes! Let’s go, right now!', 'That’s the spirit, come on.'],
  },
  {
    moment: 'disapprove',
    trait: 'tireless',
    lines: ['We could have pushed on, you know.', 'We’re giving up already? Really?'],
  },
  {
    moment: 'camp',
    trait: 'tireless',
    lines: [
      'A hundred push-ups before bed. Anyone joining me?',
      'I’m not tired, you’re tired. Fine, maybe a little.',
    ],
  },
];
