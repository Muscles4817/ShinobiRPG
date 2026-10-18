import type { VoiceDef } from '../../voices';
import { LATER_TRAIT_VOICES } from './voicesLater';

/** The crew's lines on a job, for every trait and moment. Shared by every pack. */
export const VOICES: readonly VoiceDef[] = [
  // Brash
  {
    moment: 'check-passed',
    trait: 'brash',
    lines: ['Told you it’d be easy, didn’t I?', 'Is that all it’s got? I was just warming up.'],
  },
  {
    moment: 'check-failed',
    trait: 'brash',
    lines: ['You should’ve let me do it.', 'Tch. Give it here, I’ll have another go.'],
  },
  {
    moment: 'approve',
    trait: 'brash',
    lines: ['Now we’re talking.', 'Finally, a plan with some teeth in it.'],
  },
  {
    moment: 'disapprove',
    trait: 'brash',
    lines: ['That’s so boring I could fall asleep standing.', 'We’re creeping about like mice.'],
  },
  {
    moment: 'camp',
    trait: 'brash',
    lines: [
      'Tomorrow I’m going first, and don’t bother arguing with me about it.',
      'One day they’ll write songs about this road. About me, mostly, but you can be in the chorus.',
    ],
  },
  // Calm
  {
    moment: 'check-passed',
    trait: 'calm',
    lines: ['Good. You see? No need to hurry it.', 'There, steady as you go.'],
  },
  {
    moment: 'check-failed',
    trait: 'calm',
    lines: ['It happens to all of us. Breathe, and we go on.', 'We go on all the same.'],
  },
  {
    moment: 'approve',
    trait: 'calm',
    lines: ['I think that was well judged.', 'I’d have chosen the same, in your place.'],
  },
  {
    moment: 'disapprove',
    trait: 'calm',
    lines: ['That was hasty of us.', 'There was a quieter way, I think.'],
  },
  {
    moment: 'camp',
    trait: 'calm',
    lines: [
      'Listen for a moment. You can hear the river from here.',
      'Get some sleep. I’ll keep the fire going for a while yet.',
    ],
  },
  // Diligent
  {
    moment: 'check-passed',
    trait: 'diligent',
    lines: ['That was done properly. Good.', 'Good, and on to the next thing.'],
  },
  {
    moment: 'check-failed',
    trait: 'diligent',
    lines: ['We’ll drill that when we’re home.', 'That was sloppy of us, and I include myself.'],
  },
  {
    moment: 'approve',
    trait: 'diligent',
    lines: ['That’s the job done right.', 'Agreed. Let’s get on with it, then.'],
  },
  {
    moment: 'disapprove',
    trait: 'diligent',
    lines: [
      'That’s not what we were sent here for.',
      'We’re cutting corners, and I don’t like it.',
    ],
  },
  {
    moment: 'camp',
    trait: 'diligent',
    lines: [
      'I checked the map twice. We’re on time, if nobody dawdles tomorrow.',
      'I’ll oil the blades before I sleep. Hand me yours?',
    ],
  },
  // Lazy
  {
    moment: 'check-passed',
    trait: 'lazy',
    lines: ['Look at that, less work for all of us.', 'Great. Can we sit down now?'],
  },
  {
    moment: 'check-failed',
    trait: 'lazy',
    lines: ['Well, that means more walking.', 'Ugh, and I was nearly comfortable.'],
  },
  {
    moment: 'approve',
    trait: 'lazy',
    lines: ['The easy way. I like you.', 'Sensible. Very sensible of you.'],
  },
  {
    moment: 'disapprove',
    trait: 'lazy',
    lines: ['That sounds like effort to me.', 'Why do we always pick the hard way?'],
  },
  {
    moment: 'camp',
    trait: 'lazy',
    lines: [
      'This is the best part of any job, the sitting down.',
      'Wake me if anything’s on fire. Anything besides the fire, I mean.',
    ],
  },
  // Kind
  {
    moment: 'check-passed',
    trait: 'kind',
    lines: ['Well done, you! Truly.', 'You were wonderful just then.'],
  },
  {
    moment: 'check-failed',
    trait: 'kind',
    lines: ['Are you hurt? Let me see.', 'That wasn’t your fault, you know.'],
  },
  {
    moment: 'approve',
    trait: 'kind',
    lines: ['Thank you for that.', 'I think that was the right thing to do.'],
  },
  {
    moment: 'disapprove',
    trait: 'kind',
    lines: ['That felt cold to me.', 'Couldn’t we have helped them somehow?'],
  },
  {
    moment: 'camp',
    trait: 'kind',
    lines: [
      'Here, take my blanket. I always run warm.',
      'I hope the people back home are eating well tonight.',
    ],
  },
  // Cunning
  {
    moment: 'check-passed',
    trait: 'cunning',
    lines: ['Neatly done, if I say so myself.', 'They’ll never know we were there.'],
  },
  {
    moment: 'check-failed',
    trait: 'cunning',
    lines: ['There was a trick to it, and we missed it.', 'Hm. I’ll remember that one.'],
  },
  {
    moment: 'approve',
    trait: 'cunning',
    lines: ['Clever. I like you more already.', 'That’ll pay off later, you watch.'],
  },
  {
    moment: 'disapprove',
    trait: 'cunning',
    lines: ['You played every card face up.', 'How honest of you. How very quaint.'],
  },
  {
    moment: 'camp',
    trait: 'cunning',
    lines: [
      'Did you see the client’s face when we mentioned the road? Interesting.',
      'Everyone lies a little at night. Go on, it’s your turn.',
    ],
  },
  ...LATER_TRAIT_VOICES,
];
