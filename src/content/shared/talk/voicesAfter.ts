import type { VoiceDef } from '../../voices';

/**
 * What the crew say once something has happened: after a fight on the job (the first quiet
 * moment after it), and by the fire when you made a choice earlier that sat badly with them.
 * Lines answer the moment, so they speak of it, in each trait's own way.
 */
export const AFTER_VOICES: readonly VoiceDef[] = [
  {
    moment: 'after-fight',
    trait: 'brash',
    lines: [
      'Did you see the second one go down? I want that written in the report. My name, spelled right.',
      'That was a warm-up, wasn’t it? Tell me there are more of them further on.',
    ],
  },
  {
    moment: 'after-fight',
    trait: 'calm',
    lines: [
      'Sit for a moment before we go on. Your hands will stop shaking on their own if you let them.',
      'Everyone whole? Good. Then we take it slowly from here.',
    ],
  },
  {
    moment: 'after-fight',
    trait: 'diligent',
    lines: [
      'I’ve counted the kunai. We left two in the brush, and I’d like them back before we go.',
      'We were slow at the start. I’ll write down where, so we can drill it at home.',
    ],
  },
  {
    moment: 'after-fight',
    trait: 'lazy',
    lines: [
      'Is there any chance the rest of this job is sitting down? Even partly?',
      'I need a nap, and then I need to hear how the client thanks us. Probably in that order.',
    ],
  },
  {
    moment: 'after-fight',
    trait: 'kind',
    lines: [
      'Is anyone hurt? Let me see your arm before you say no.',
      'I hope they find somewhere better to be than a road with a knife.',
    ],
  },
  {
    moment: 'after-fight',
    trait: 'cunning',
    lines: [
      'They had a fallback and never used it. Somebody told them to hold back, and I’d like to know who.',
      'Search the packs before we go. People like that carry more than coin.',
    ],
  },
  {
    moment: 'after-fight',
    trait: 'proud',
    lines: [
      'I didn’t need the help, for the record, but it was well timed.',
      'They’ll think twice before they try that on anyone from our village.',
    ],
  },
  {
    moment: 'after-fight',
    trait: 'humble',
    lines: [
      'I froze for a second at the start. I’m sorry, it won’t happen again.',
      'You were faster than me back there. I’d like to know how, if you’ll show me.',
    ],
  },
  {
    moment: 'after-fight',
    trait: 'curious',
    lines: [
      'Did you see what he did with his feet before he swung? I want to try that.',
      'I’ve never seen anyone hold a club like that. Do you think it’s a style, or just bad?',
    ],
  },
  {
    moment: 'after-fight',
    trait: 'focused',
    lines: [
      'Check your gear and drink something. We’re still on the job.',
      'That’s behind us. Eyes ahead now, there may be more of them on the road.',
    ],
  },
  {
    moment: 'after-fight',
    trait: 'tireless',
    lines: [
      'I could go again right now if we had to, honestly I could.',
      'Let’s keep moving while we’re warm. We’ll make up the time.',
    ],
  },
  {
    moment: 'grudge',
    trait: 'brash',
    lines: [
      'Back on the road, earlier. We could’ve settled that properly and you didn’t let us.',
      'I’m still thinking about what you chose back there, and I still think it was soft.',
    ],
  },
  {
    moment: 'grudge',
    trait: 'calm',
    lines: [
      'About earlier. I’d have done it differently, but I see why you didn’t. Mostly.',
      'You decided quickly today. Next time, ask us first, even if you don’t change your mind.',
    ],
  },
  {
    moment: 'grudge',
    trait: 'diligent',
    lines: [
      'What you did earlier isn’t in our orders. I’ll have to explain it when we report, you know.',
      'I don’t like how we handled that choice today. I keep going over it.',
    ],
  },
  {
    moment: 'grudge',
    trait: 'lazy',
    lines: [
      'That thing you chose earlier made a lot more work for everyone. I just want that noted.',
      'Next time there’s an easy way and a hard way, could we try the easy one? Once?',
    ],
  },
  {
    moment: 'grudge',
    trait: 'kind',
    lines: [
      'I can’t stop thinking about earlier. Couldn’t we have helped, even a little?',
      'You were hard on them today. I know it’s the job, but it sat badly with me.',
    ],
  },
  {
    moment: 'grudge',
    trait: 'cunning',
    lines: [
      'That choice earlier was honest, and honest is expensive. I hope you know what it cost us.',
      'There was a smarter way through that, and I think you saw it and didn’t take it.',
    ],
  },
  {
    moment: 'grudge',
    trait: 'proud',
    lines: [
      'We looked weak back there. I don’t enjoy looking weak in front of a client.',
      'I won’t pretend I agreed with you earlier. A shinobi of our village doesn’t do that.',
    ],
  },
  {
    moment: 'grudge',
    trait: 'humble',
    lines: [
      'I didn’t say anything earlier, but I wasn’t sure about it. I’m still not.',
      'Can I ask why you chose what you did, back there? I’ve been trying to understand it.',
    ],
  },
  {
    moment: 'grudge',
    trait: 'curious',
    lines: [
      'Why did you go that way earlier? I’d have liked to see what happened the other way.',
      'I keep wondering how it would have gone if we’d done it differently today.',
    ],
  },
  {
    moment: 'grudge',
    trait: 'focused',
    lines: [
      'Earlier was a distraction from the job. Let’s not do that again.',
      'What you chose today cost us time we didn’t have. Tomorrow we keep to the task.',
    ],
  },
  {
    moment: 'grudge',
    trait: 'tireless',
    lines: [
      'We sat on our hands back there when we could have done something. That bothers me.',
      'I’d have pushed on today. I’m not angry, I just wanted to say so.',
    ],
  },
];
