import type { PersonDef, Tone } from '@/content';
import { fillSlots } from '@/core';

import { personSlots } from '../people/pronouns';
import type { Contest, RivalShape, Temperament } from './state';

/**
 * What a rival says, and what you may say back. Written for anyone (the rival is `{name}`, and
 * `{name.they}`, `{name.their}`, `{name.s}`… agree with their pronouns), by the shape of the gap
 * and their temperament, so the same moment sounds like the person it is.
 */

/** A rival's line with their name and pronouns filled in. */
export function rivalLine(text: string, rival: PersonDef): string {
  return fillSlots(text, personSlots('name', rival));
}

export interface ReplyOption {
  readonly tone: Tone;
  readonly say: string;
  /** How the moment itself moves the heat, before their tastes add anything. */
  readonly heat: number;
  /** It gets to them: they run worse in the next race. */
  readonly rattles?: boolean;
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
    cold: '“I’ll pass you by summer.” Then {name.they} walk{name.s} on.',
  },
  fallen: {
    proud: '“They read your name. Fine. The order’s what matters, and you’re still behind me.”',
    kind: '“You’ve come a long way this year. I noticed. I suppose I should be worried.”',
    cold: '“The honours were the last time anyone will put you above me.” Not that {name.they} sound{name.s} sure.',
  },
};

export const MEETING_REPLIES: readonly ReplyOption[] = [
  { tone: 'challenge', say: '“Enjoy it while it lasts.”', heat: 0 },
  { tone: 'kind', say: '“Good luck to you too. I mean it.”', heat: 4 },
  { tone: 'earnest', say: '“I’ll beat you, and you’ll know you were beaten.”', heat: 2 },
  { tone: 'quiet', say: 'Hold {name.their} look, and walk past.', heat: -2 },
];

export const AFTER_SPAR_REPLIES: Readonly<Record<'won' | 'lost', readonly ReplyOption[]>> = {
  won: [
    { tone: 'kind', say: '“Well fought. That was close.”', heat: 8 },
    { tone: 'tease', say: '“Was that your best? You’re shaking.”', heat: -10, rattles: true },
    { tone: 'challenge', say: '“Again tomorrow. I want the real you.”', heat: 3 },
    { tone: 'quiet', say: 'Nod, and walk off the ground.', heat: 0 },
  ],
  lost: [
    { tone: 'kind', say: '“You earned that. I’ll remember the feint.”', heat: 6 },
    { tone: 'tease', say: '“Enjoy it. It won’t happen twice.”', heat: -6, rattles: true },
    { tone: 'earnest', say: '“Next time I’ll be ready for that.”', heat: 4 },
    { tone: 'quiet', say: 'Pick yourself up and say nothing.', heat: -2 },
  ],
};

export const AFTER_RACE_REPLIES: Readonly<Record<'won' | 'lost', readonly ReplyOption[]>> = {
  won: [
    { tone: 'kind', say: '“You made me run for it. Thank you.”', heat: 8 },
    { tone: 'tease', say: '“Need a hand up the steps next time?”', heat: -10, rattles: true },
    { tone: 'challenge', say: '“Same course, next week. Bring your legs.”', heat: 3 },
    {
      tone: 'quiet',
      say: 'Get your breath back, and leave {name.them} to {name.theirs}.',
      heat: 0,
    },
  ],
  lost: [
    { tone: 'kind', say: '“That last stretch was something. Well run.”', heat: 6 },
    { tone: 'tease', say: '“You only won because you had the roofs.”', heat: -6, rattles: true },
    { tone: 'earnest', say: '“I’ll know the course next time.”', heat: 4 },
    { tone: 'quiet', say: 'Hands on knees, say nothing.', heat: -2 },
  ],
};

export function afterReplies(contest: Contest, won: boolean): readonly ReplyOption[] {
  return (contest === 'race' ? AFTER_RACE_REPLIES : AFTER_SPAR_REPLIES)[won ? 'won' : 'lost'];
}

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
    warmer: '{name} says nothing, but nods once, which is a speech by {name.their} standards.',
    cooler: '{name} turns away as if you weren’t there.',
  },
};

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

export const RACE_CHALLENGE_LINES: Readonly<
  Record<Temperament, Readonly<Record<ChallengeReason, string>>>
> = {
  proud: {
    'they-first': '“I got there first. Race me to the bell tower and I’ll show you how.”',
    'you-first': '“Grades are paper. Legs aren’t. The bell tower, today.”',
    routine: '“Gate to the bell tower. Loser carries the other’s pack for a week.”',
  },
  kind: {
    'they-first': '“I’ve never felt this quick! Race me? Gate to the bell tower.”',
    'you-first': '“You’re getting quick. Race me to the bell tower, for fun?”',
    routine: '“Race you to the bell tower? Last one there buys the tea.”',
  },
  cold: {
    'they-first': 'Chalked on the gate of the training ground: “Bell tower. Today.”',
    'you-first': '“Gate. Bell tower.” {name.they} {name.is} already stretching.',
    routine: 'A line scratched across the gatepost, and an arrow to the bell tower.',
  },
};

/** What they say as you put the challenge to them. */
export const TAKEN_UP: Readonly<Record<Temperament, string>> = {
  proud: '“Finally, some nerve.” {name} is there before you are.',
  kind: '“Oh, yes!” {name} looks delighted, which is somehow worse.',
  cold: '{name} sets down what {name.they} {name.was} doing and nods once.',
};

/** What turning a challenge down costs, by temperament, and what they make of it. */
export const DECLINED: Readonly<
  Record<Temperament, { readonly heat: number; readonly line: string }>
> = {
  proud: { heat: -8, line: '{name} tells anyone who’ll listen that you were afraid.' },
  kind: { heat: -3, line: '{name} says “Another time, then,” and means it.' },
  cold: { heat: -5, line: '{name} doesn’t ask again for a while.' },
};
