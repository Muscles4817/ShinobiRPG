import type { VoiceDef } from '../../voices';
import { AFTER_VOICES } from './voicesAfter';
import { CHOICE_VOICES } from './voicesChoice';

/**
 * The crew's lines on a job after a check, by trait, shared by every pack. People talk like
 * people here: a half-sentence, a question back, their own turn of phrase, rarely a quip.
 */
const CHECK_VOICES: readonly VoiceDef[] = [
  {
    moment: 'check-passed',
    trait: 'brash',
    lines: [
      'See? I said it would be easy, and nobody listens to me.',
      'Is that all it had? I was just getting warmed up.',
    ],
  },
  {
    moment: 'check-failed',
    trait: 'brash',
    lines: [
      'You should have let me go first. I keep saying so.',
      'Again? Next time stand back and let me at it.',
    ],
  },
  {
    moment: 'check-passed',
    trait: 'calm',
    lines: [
      'There, you see, no need to hurry it.',
      'That was steady. Do it like that every time and we’ll be fine.',
    ],
  },
  {
    moment: 'check-failed',
    trait: 'calm',
    lines: [
      'It happens to everyone. Take a breath before the next thing.',
      'We go on all the same, it isn’t the end of the job.',
    ],
  },
  {
    moment: 'check-passed',
    trait: 'diligent',
    lines: [
      'Done properly, and on time. I’ll put that in the report.',
      'Good. I had a second plan ready, but I’m glad we didn’t need it.',
    ],
  },
  {
    moment: 'check-failed',
    trait: 'diligent',
    lines: [
      'We should drill that when we get home, both of us.',
      'That was sloppy, and I’m counting myself in that.',
    ],
  },
  {
    moment: 'check-passed',
    trait: 'lazy',
    lines: [
      'Oh good, that’s less work for everyone. Can we sit down a minute?',
      'Look at that, and nobody even had to run.',
    ],
  },
  {
    moment: 'check-failed',
    trait: 'lazy',
    lines: [
      'Well, that means more walking, doesn’t it.',
      'I was really hoping that would work the first time.',
    ],
  },
  {
    moment: 'check-passed',
    trait: 'kind',
    lines: [
      'You did that so well. I mean it, I was watching.',
      'Oh, that was lovely to see. Are you all right?',
    ],
  },
  {
    moment: 'check-failed',
    trait: 'kind',
    lines: [
      'Are you hurt? Let me look before you say you’re fine.',
      'That wasn’t your fault, whatever you’re telling yourself.',
    ],
  },
  {
    moment: 'check-passed',
    trait: 'cunning',
    lines: [
      'Neatly done. Nobody will ever know how close that was.',
      'I’d have done it the same way, only I’d have charged more.',
    ],
  },
  {
    moment: 'check-failed',
    trait: 'cunning',
    lines: [
      'There was a trick to that and we both walked past it.',
      'I’ll remember that one. It won’t catch me twice.',
    ],
  },
  {
    moment: 'check-passed',
    trait: 'proud',
    lines: [
      'Of course. What did anyone expect from us?',
      'That is how it’s done where I come from.',
    ],
  },
  {
    moment: 'check-failed',
    trait: 'proud',
    lines: [
      'That doesn’t count, the ground was against us.',
      'An off day, and nobody needs to hear about it back home.',
    ],
  },
  {
    moment: 'check-passed',
    trait: 'humble',
    lines: [
      'You made that look easy. I don’t think I could have.',
      'I think we were lucky there, weren’t we?',
    ],
  },
  {
    moment: 'check-failed',
    trait: 'humble',
    lines: [
      'I couldn’t have done better, honestly. Nobody could.',
      'Next time, maybe. We’re still learning.',
    ],
  },
  {
    moment: 'check-passed',
    trait: 'curious',
    lines: [
      'How did you know to do that? Will you show me later?',
      'It worked! I wasn’t sure it would, were you?',
    ],
  },
  {
    moment: 'check-failed',
    trait: 'curious',
    lines: [
      'Why didn’t that work, though? It should have.',
      'Wrong, but I want to know why it was wrong.',
    ],
  },
  {
    moment: 'check-passed',
    trait: 'focused',
    lines: ['Good, that’s done. Next.', 'Clean work. Keep your mind on the road now.'],
  },
  {
    moment: 'check-failed',
    trait: 'focused',
    lines: ['Shake it off and reset. We still have a job to do.', 'Forget it, it’s behind us.'],
  },
  {
    moment: 'check-passed',
    trait: 'tireless',
    lines: [
      'Good! What’s next? I could do that all day.',
      'That felt good, didn’t it? Let’s keep going.',
    ],
  },
  {
    moment: 'check-failed',
    trait: 'tireless',
    lines: [
      'Then I’ll carry it myself, it’s no trouble.',
      'We keep going. We’ll make the time up somewhere.',
    ],
  },
];

/** Every crew line: at each moment of a job, and after what happened on it. */
export const VOICES: readonly VoiceDef[] = [...CHECK_VOICES, ...CHOICE_VOICES, ...AFTER_VOICES];
