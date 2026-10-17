import type { Tone } from '@/content';

import type { RivalBeat, RivalShape, Temperament } from './state';

/**
 * What a rival says, and what you may say back. Written for anyone (names are filled in as
 * `{name}`, never a pronoun), by the shape of the gap and their temperament, so the same
 * moment sounds like the person it is.
 */

export interface ReplyOption {
  readonly tone: Tone;
  readonly say: string;
  /** How the moment itself moves the heat, before their tastes add anything. */
  readonly heat: number;
}

export const SHAPE_NAME: Readonly<Record<RivalShape, string>> = {
  prodigy: 'The prodigy',
  neck: 'Neck and neck',
  chaser: 'The chaser',
  fallen: 'The fallen star',
};

/** How they stand to you, by shape and temperament: the Rivalry tab's first lines. */
export const WHO_THEY_ARE: Readonly<Record<RivalShape, Readonly<Record<Temperament, string>>>> = {
  prodigy: {
    proud:
      'Ahead of you and pulling away, and sure you will never catch up. Polite about it, which is worse.',
    kind: 'Ahead of you and kind about it. The pity stings more than any insult would.',
    cold: 'Ahead of you, and hardly seems to know you are there.',
  },
  neck: {
    proud: 'Neck and neck with you, and furious about it. Every win is a rematch waiting.',
    kind: 'Neck and neck with you. A real rivalry: you push each other on.',
    cold: 'Neck and neck with you. Says nothing, misses nothing.',
  },
  chaser: {
    proud: 'Behind you and hates it. Every excuse in the book, and a few new ones.',
    kind: 'Behind you, and glad for you, which somehow makes it harder to stay ahead.',
    cold: 'Behind you. Trains when you sleep.',
  },
  fallen: {
    proud: 'Ahead of you at graduation, and holding on with both hands as the gap closes.',
    kind: 'Ahead of you at graduation, and starting to wonder why it comes so hard now.',
    cold: 'Ahead of you at graduation. Quieter every week you close the gap.',
  },
};

/** The first words, when word gets round which team you landed on. */
export const MEETING: Readonly<Record<RivalShape, Readonly<Record<Temperament, string>>>> = {
  prodigy: {
    proud: '“Congratulations on your team. Truly. Do try to keep up; it would be dull otherwise.”',
    kind: '“I hope your sensei is patient. I mean that kindly. I’ll help, if you ever ask.”',
    cold: '“You’re the one from the back of the hall.” It isn’t a question.',
  },
  neck: {
    proud: '“Good. I wanted you close enough to beat.”',
    kind: '“Looks like it’s you and me, then. Let’s make each other better.”',
    cold: '“I’ve watched you train. You drop your guard on the left.”',
  },
  chaser: {
    proud: '“Enjoy the view from up there. It won’t last the season.”',
    kind: '“You were always a step ahead of me. Not for long, I hope. Is that all right?”',
    cold: '“I’ll pass you by summer.” Then they walk on.',
  },
  fallen: {
    proud: '“They read your name. Fine. The order’s what matters, and you’re still behind me.”',
    kind: '“You’ve come a long way this year. I noticed. I suppose I should be worried.”',
    cold: '“The honours were the last time anyone will put you above me.” They don’t sound sure.',
  },
};

export const MEETING_REPLIES: readonly ReplyOption[] = [
  { tone: 'challenge', say: '“Enjoy it while it lasts.”', heat: 0 },
  { tone: 'kind', say: '“Good luck to you too. I mean it.”', heat: 4 },
  { tone: 'earnest', say: '“I’ll beat you, and you’ll know you were beaten.”', heat: 2 },
  { tone: 'quiet', say: 'Hold their look, and walk past.', heat: -2 },
];

export const AFTER_SPAR_REPLIES: Readonly<Record<'won' | 'lost', readonly ReplyOption[]>> = {
  won: [
    { tone: 'kind', say: '“Well fought. That was close.”', heat: 8 },
    { tone: 'tease', say: '“Was that your best? You’re shaking.”', heat: -10 },
    { tone: 'challenge', say: '“Again tomorrow. I want the real you.”', heat: 3 },
    { tone: 'quiet', say: 'Nod, and walk off the ground.', heat: 0 },
  ],
  lost: [
    { tone: 'kind', say: '“You earned that. I’ll remember the feint.”', heat: 6 },
    { tone: 'tease', say: '“Enjoy it. It won’t happen twice.”', heat: -6 },
    { tone: 'earnest', say: '“Next time I’ll be ready for that.”', heat: 4 },
    { tone: 'quiet', say: 'Pick yourself up and say nothing.', heat: -2 },
  ],
};

/** Their answer, by how it landed: warmer or cooler. */
export const ANSWER: Readonly<
  Record<Temperament, { readonly warmer: string; readonly cooler: string }>
> = {
  proud: {
    warmer: '{name} looks at you a moment longer than usual. “Hm. Maybe you’re worth the trouble.”',
    cooler: '{name}’s smile goes thin. “I’ll remember that.”',
  },
  kind: {
    warmer: '{name} laughs, properly. “That’s the spirit.”',
    cooler: '{name} looks hurt, then hides it badly.',
  },
  cold: {
    warmer: '{name} says nothing, but nods once, which is a speech by their standards.',
    cooler: '{name} turns away as if you weren’t there.',
  },
};

export function repliesFor(beat: RivalBeat): readonly ReplyOption[] {
  return beat.kind === 'meeting' ? MEETING_REPLIES : AFTER_SPAR_REPLIES[beat.won ? 'won' : 'lost'];
}

export type ChallengeReason = 'they-first' | 'you-first' | 'routine';

export const CHALLENGE_LINES: Readonly<
  Record<Temperament, Readonly<Record<ChallengeReason, string>>>
> = {
  proud: {
    'they-first':
      '“I got there first. Come to the training ground and see what the difference looks like.”',
    'you-first': '“One grade proves nothing. The training ground, today.”',
    routine: '“I’m bored. Spar with me, if you dare.”',
  },
  kind: {
    'they-first': '“I had a breakthrough! Spar with me? I want to see if it holds up.”',
    'you-first': '“You got there first. Show me how?”',
    routine: '“A spar, if you’re free? I’ll be at the training ground.”',
  },
  cold: {
    'they-first': 'A note in neat hand: “Training ground. Today.”',
    'you-first': '“Again. Training ground.” Nothing else.',
    routine: 'A stone left on your step, a training-ground mark scratched on it.',
  },
};

/** What turning a challenge down costs, by temperament, and what they make of it. */
export const DECLINED: Readonly<
  Record<Temperament, { readonly heat: number; readonly line: string }>
> = {
  proud: { heat: -8, line: '{name} tells anyone who’ll listen that you were afraid.' },
  kind: { heat: -3, line: '{name} says “Another time, then,” and means it.' },
  cold: { heat: -5, line: '{name} doesn’t ask again for a while.' },
};
