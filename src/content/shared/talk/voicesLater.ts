import type { VoiceDef } from '../../voices';

/** The crew's lines for the proud, humble, curious, focused and tireless, at every moment. */
export const LATER_TRAIT_VOICES: readonly VoiceDef[] = [
  // Proud
  {
    moment: 'check-passed',
    trait: 'proud',
    lines: ['As I expected.', 'Naturally. Did anyone doubt it?'],
  },
  {
    moment: 'check-failed',
    trait: 'proud',
    lines: ['That one doesn’t count.', 'An off day for me, nothing more.'],
  },
  {
    moment: 'approve',
    trait: 'proud',
    lines: ['Finally, a decision worthy of us.', 'Good. Now do it boldly.'],
  },
  {
    moment: 'disapprove',
    trait: 'proud',
    lines: ['That’s beneath us.', 'Is that really the best we can do?'],
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
    lines: ['You made that look easy.', 'I think I was lucky there.'],
  },
  {
    moment: 'check-failed',
    trait: 'humble',
    lines: ['I couldn’t have done any better, honestly.', 'Next time, then. We’ll get it.'],
  },
  {
    moment: 'approve',
    trait: 'humble',
    lines: ['I think that was right.', 'Yes, I think so too. Thank you.'],
  },
  {
    moment: 'disapprove',
    trait: 'humble',
    lines: ['I’m not sure about that…', 'If you think so, I suppose.'],
  },
  {
    moment: 'camp',
    trait: 'humble',
    lines: [
      'I’m just glad to be out here with you all.',
      'Will you teach me that trick you did today?',
    ],
  },
  // Curious
  {
    moment: 'check-passed',
    trait: 'curious',
    lines: ['How did you know to do that?', 'Huh! It actually worked!'],
  },
  {
    moment: 'check-failed',
    trait: 'curious',
    lines: ['Why didn’t that work, though?', 'Interesting. Wrong, but I’d like to know why.'],
  },
  {
    moment: 'approve',
    trait: 'curious',
    lines: ['Let’s see what happens!', 'Ooh, yes, let’s do that.'],
  },
  {
    moment: 'disapprove',
    trait: 'curious',
    lines: ['But now we’ll never find out.', 'Aw. I wanted to see what was in there.'],
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
  {
    moment: 'check-passed',
    trait: 'focused',
    lines: ['Good, that was clean.', 'Clean work. Keep it that way.'],
  },
  {
    moment: 'check-failed',
    trait: 'focused',
    lines: ['Reset and go again.', 'Shake it off. We’re not done.'],
  },
  {
    moment: 'approve',
    trait: 'focused',
    lines: ['That’s the right call.', 'Agreed. Let’s go.'],
  },
  {
    moment: 'disapprove',
    trait: 'focused',
    lines: ['That’s a distraction from the job.', 'That’s not what we’re here for.'],
  },
  {
    moment: 'camp',
    trait: 'focused',
    lines: ['First watch is mine.', 'The road narrows tomorrow, past the ridge. Be ready for it.'],
  },
  // Tireless
  {
    moment: 'check-passed',
    trait: 'tireless',
    lines: ['Good! What’s next?', 'Again! No? Fine, on we go.'],
  },
  {
    moment: 'check-failed',
    trait: 'tireless',
    lines: ['I’ll carry it, then.', 'We keep going. Come on.'],
  },
  {
    moment: 'approve',
    trait: 'tireless',
    lines: ['Yes! Let’s go!', 'That’s the spirit, that is.'],
  },
  {
    moment: 'disapprove',
    trait: 'tireless',
    lines: ['We could’ve pushed on, you know.', 'Giving up already?'],
  },
  {
    moment: 'camp',
    trait: 'tireless',
    lines: [
      'Two hundred push-ups before bed. Will you join me?',
      'I’m not tired. You’re tired. Go to sleep, I’ll be up a while.',
    ],
  },
];
