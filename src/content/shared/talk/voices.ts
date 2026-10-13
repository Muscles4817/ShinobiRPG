import type { VoiceDef } from '../../voices';

/** The crew's lines on a job, for every trait and moment. Shared by every pack. */
export const VOICES: readonly VoiceDef[] = [
  // Brash
  { moment: 'check-passed', trait: 'brash', lines: ['Told you. Easy.', 'That all it’s got?'] },
  { moment: 'check-failed', trait: 'brash', lines: ['Should’ve let me do it.', 'Tch. Again.'] },
  {
    moment: 'approve',
    trait: 'brash',
    lines: ['Now we’re talking.', 'Finally, something with teeth.'],
  },
  { moment: 'disapprove', trait: 'brash', lines: ['Boring.', 'We’re creeping about like mice.'] },
  {
    moment: 'camp',
    trait: 'brash',
    lines: [
      'Tomorrow I’m going first. Don’t argue.',
      'One day they’ll write songs about this road. About me, mostly.',
    ],
  },
  // Calm
  { moment: 'check-passed', trait: 'calm', lines: ['Good. Steady.', 'There. No hurry needed.'] },
  {
    moment: 'check-failed',
    trait: 'calm',
    lines: ['It happens. Breathe.', 'We go on all the same.'],
  },
  {
    moment: 'approve',
    trait: 'calm',
    lines: ['That was well judged.', 'Mm. I’d have done the same.'],
  },
  { moment: 'disapprove', trait: 'calm', lines: ['That was hasty.', 'There was a quieter way.'] },
  {
    moment: 'camp',
    trait: 'calm',
    lines: ['Listen. You can hear the river from here.', 'Sleep. The fire will keep.'],
  },
  // Diligent
  { moment: 'check-passed', trait: 'diligent', lines: ['Done properly.', 'Good. Next.'] },
  {
    moment: 'check-failed',
    trait: 'diligent',
    lines: ['We’ll drill that when we’re home.', 'Sloppy. Mine too.'],
  },
  {
    moment: 'approve',
    trait: 'diligent',
    lines: ['That’s the job done right.', 'Agreed. Let’s get to it.'],
  },
  {
    moment: 'disapprove',
    trait: 'diligent',
    lines: ['That’s not what we were sent for.', 'Cutting corners.'],
  },
  {
    moment: 'camp',
    trait: 'diligent',
    lines: ['I checked the map twice. We’re on time.', 'I’ll oil the blades before I sleep.'],
  },
  // Lazy
  {
    moment: 'check-passed',
    trait: 'lazy',
    lines: ['Look at that. Less work.', 'Great. Can we sit down?'],
  },
  { moment: 'check-failed', trait: 'lazy', lines: ['Well, that’s more walking.', 'Ugh.'] },
  {
    moment: 'approve',
    trait: 'lazy',
    lines: ['The easy way. I like it.', 'Sensible. Very sensible.'],
  },
  {
    moment: 'disapprove',
    trait: 'lazy',
    lines: ['That sounds like effort.', 'Why do we always pick the hard way?'],
  },
  {
    moment: 'camp',
    trait: 'lazy',
    lines: [
      'Best part of a job, this. The sitting.',
      'Wake me if anything’s on fire. Besides the fire.',
    ],
  },
  // Kind
  { moment: 'check-passed', trait: 'kind', lines: ['Well done! Truly.', 'You were wonderful.'] },
  {
    moment: 'check-failed',
    trait: 'kind',
    lines: ['Are you hurt? Let me see.', 'It wasn’t your fault.'],
  },
  { moment: 'approve', trait: 'kind', lines: ['Thank you for that.', 'That was the right thing.'] },
  { moment: 'disapprove', trait: 'kind', lines: ['That felt cold.', 'Couldn’t we have helped?'] },
  {
    moment: 'camp',
    trait: 'kind',
    lines: ['Here, take my blanket. I run warm.', 'I hope the people back home are eating well.'],
  },
  // Cunning
  { moment: 'check-passed', trait: 'cunning', lines: ['Neatly done.', 'They’ll never know.'] },
  {
    moment: 'check-failed',
    trait: 'cunning',
    lines: ['There was a trick to it. We missed it.', 'Hm. Noted.'],
  },
  {
    moment: 'approve',
    trait: 'cunning',
    lines: ['Clever. I like you more already.', 'That’ll pay off later.'],
  },
  {
    moment: 'disapprove',
    trait: 'cunning',
    lines: ['You played every card face up.', 'Honest. How quaint.'],
  },
  {
    moment: 'camp',
    trait: 'cunning',
    lines: [
      'Did you see the client’s face when we mentioned the road? Interesting.',
      'Everyone lies a little at night. Go on, your turn.',
    ],
  },
  // Proud
  { moment: 'check-passed', trait: 'proud', lines: ['As expected.', 'Naturally.'] },
  {
    moment: 'check-failed',
    trait: 'proud',
    lines: ['That doesn’t count.', 'An off day. Nothing more.'],
  },
  {
    moment: 'approve',
    trait: 'proud',
    lines: ['Finally, a decision worthy of us.', 'Good. Do it boldly.'],
  },
  {
    moment: 'disapprove',
    trait: 'proud',
    lines: ['Beneath us.', 'Is that really the best we can do?'],
  },
  {
    moment: 'camp',
    trait: 'proud',
    lines: [
      'My family walked this road before the village had walls.',
      'I’ll take the hard watch. Obviously.',
    ],
  },
  // Humble
  {
    moment: 'check-passed',
    trait: 'humble',
    lines: ['You made that look easy.', 'Lucky, I think.'],
  },
  {
    moment: 'check-failed',
    trait: 'humble',
    lines: ['I couldn’t have done better.', 'Next time, then.'],
  },
  { moment: 'approve', trait: 'humble', lines: ['I think that was right.', 'Yes. Thank you.'] },
  {
    moment: 'disapprove',
    trait: 'humble',
    lines: ['I’m not sure about that…', 'If you think so.'],
  },
  {
    moment: 'camp',
    trait: 'humble',
    lines: ['I’m just glad to be out here with you all.', 'Teach me that trick you did today?'],
  },
  // Curious
  {
    moment: 'check-passed',
    trait: 'curious',
    lines: ['How did you know to do that?', 'Huh! It worked!'],
  },
  {
    moment: 'check-failed',
    trait: 'curious',
    lines: ['Why didn’t that work, though?', 'Interesting. Wrong, but interesting.'],
  },
  { moment: 'approve', trait: 'curious', lines: ['Let’s see what happens!', 'Ooh. Good.'] },
  {
    moment: 'disapprove',
    trait: 'curious',
    lines: ['But we’ll never find out now.', 'Aw. I wanted to see.'],
  },
  {
    moment: 'camp',
    trait: 'curious',
    lines: [
      'Do you think the stars look different from other villages?',
      'What’s the strangest job you’ve ever heard of?',
    ],
  },
  // Focused
  { moment: 'check-passed', trait: 'focused', lines: ['Good.', 'Clean.'] },
  { moment: 'check-failed', trait: 'focused', lines: ['Reset. Go again.', 'Shake it off.'] },
  { moment: 'approve', trait: 'focused', lines: ['Right call.', 'Agreed.'] },
  { moment: 'disapprove', trait: 'focused', lines: ['A distraction.', 'That’s not the job.'] },
  {
    moment: 'camp',
    trait: 'focused',
    lines: ['First watch is mine.', 'Tomorrow, the road narrows. Be ready.'],
  },
  // Tireless
  { moment: 'check-passed', trait: 'tireless', lines: ['Good! What’s next?', 'Again! No? Fine.'] },
  { moment: 'check-failed', trait: 'tireless', lines: ['I’ll carry it, then.', 'We keep going.'] },
  { moment: 'approve', trait: 'tireless', lines: ['Yes! Let’s go!', 'That’s the spirit.'] },
  {
    moment: 'disapprove',
    trait: 'tireless',
    lines: ['We could’ve pushed on.', 'Giving up already?'],
  },
  {
    moment: 'camp',
    trait: 'tireless',
    lines: ['Two hundred push-ups before bed. Join me?', 'I’m not tired. You’re tired.'],
  },
];
