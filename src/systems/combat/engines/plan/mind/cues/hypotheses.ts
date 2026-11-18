import { cardId, findCard, fitsBand, type Card } from '../../cards';
import type { RangeBand } from '../../../../contract';
import { classOf, cueProfile, type Channel, type CueClass, type CueProfile } from './profile';
import type { Read, Sighting } from './observe';

/**
 * What an observer could think a foe is readying (`docs/design/combat-ai-plan.md` Part 5): the
 * basics anyone has, the cards seen from this foe so far (weighted by habit), a form recognised,
 * and three buckets for "something not seen yet" (a technique, a body move, a counter stance)
 * whose weight fades as the fight goes on.
 */

/** Priors per basic class (what anyone might do); a habit adds HABIT per time seen. */
const BASIC_PRIOR: Readonly<Partial<Record<CueClass, number>>> = {
  blow: 1,
  throw: 0.5,
  'step-in': 0.6,
  'step-back': 0.4,
  evade: 0.25,
  brace: 0.25,
  gather: 0.25,
  search: 1,
  dispel: 1,
};
const HABIT = 0.6;
/** A card seen from this foe, before any habit. */
const SEEN_PRIOR = 0.5;
/** "Something I haven't seen": strong at the start, fading as the fight goes on. */
const UNSEEN_PRIOR = 0.8;
const UNSEEN_DECAY = 4;

const BASIC_IDS = [
  'strike',
  'throw',
  'step-in',
  'step-back',
  'evade',
  'brace',
  'gather',
  'search',
  'dispel',
];

/** Per channel, how likely each value is under a bucket. */
export type Bucket = Readonly<Record<Channel, Readonly<Record<string, number>>>>;

export interface Hypothesis {
  readonly id: string;
  readonly cls: CueClass;
  readonly prior: number;
  readonly profile?: CueProfile;
  readonly bucket?: Bucket;
}

const UNSEEN_TECHNIQUE: Bucket = {
  body: { coiled: 0.1 },
  hands: { seals: 1, fist: 0.3, blade: 0.3, pouch: 0.05, none: 0.3 },
  chakra: { flare: 1, draw: 0.1, none: 0.3 },
  stillness: { still: 0.3, none: 1 },
  eyes: { fixed: 1, scan: 0.1, none: 0.6 },
  form: { unfamiliar: 1, none: 0.05 },
};
const UNSEEN_STANCE: Bucket = {
  body: { coiled: 1, settle: 0.3, forward: 0.05, back: 0.05, square: 0.1, light: 0.1, none: 0.1 },
  hands: { fist: 1, blade: 1, seals: 0.5, pouch: 0.05, none: 0.5 },
  chakra: {},
  stillness: { none: 1, still: 0.4 },
  eyes: {},
  form: { unfamiliar: 1, none: 0.3 },
};
const UNSEEN_MOVE: Bucket = {
  body: { forward: 1, square: 0.4, coiled: 0.05 },
  hands: { fist: 1, blade: 1, seals: 0.1, pouch: 0.05, none: 0.3 },
  chakra: { none: 1, flare: 0.2, draw: 0.05 },
  stillness: { none: 1, still: 0.2 },
  eyes: { fixed: 1, none: 0.6, scan: 0.1 },
  form: { unfamiliar: 1, none: 0.05 },
};

/** Where the read is made: the distance, how far into the fight, and what makes a basic likely. */
export interface Situation {
  readonly band: RangeBand;
  readonly exchange: number;
  /** The observer is hiding: a Search becomes likely. */
  readonly observerHidden: boolean;
  /** The foe is confused, or a field is up: a Dispel becomes likely. */
  readonly illusionAbout: boolean;
}

function basicPrior(id: string, card: Card, s: Situation): number {
  if (id === 'search' && !s.observerHidden) return 0;
  if (id === 'dispel' && !s.illusionAbout && !s.observerHidden) return 0;
  return BASIC_PRIOR[classOf(card)] ?? 0;
}

/** Every hypothesis, for a reading of this sighting. */
export function candidates(
  read: Read & { readonly habits: Readonly<Record<string, number>> },
  sighting: Sighting,
  s: Situation,
): Hypothesis[] {
  const { actor } = read;
  const out = new Map<string, Hypothesis>();
  const add = (card: Card | null, prior: number) => {
    if (!card || !fitsBand(card, s.band) || prior <= 0) return;
    const id = cardId(card);
    if (out.has(id)) return;
    const habit = (read.habits[id] ?? 0) * HABIT;
    out.set(id, { id, cls: classOf(card), prior: prior + habit, profile: cueProfile(card, actor) });
  };
  for (const id of BASIC_IDS) {
    const card = findCard(actor, id);
    if (card) add(card, basicPrior(id, card, s));
  }
  for (const id of read.seenCards) add(findCard(actor, id), SEEN_PRIOR);
  const unseen = UNSEEN_PRIOR / (1 + s.exchange / UNSEEN_DECAY);
  const form = sighting.form?.value;
  // A form recognised but never seen from them: the unseen thing, revealed.
  if (form && form !== 'none' && form !== 'unfamiliar') add(findCard(actor, form), unseen);
  return [
    ...out.values(),
    { id: 'unseen-technique', cls: 'technique', prior: unseen, bucket: UNSEEN_TECHNIQUE },
    { id: 'unseen-stance', cls: 'stance', prior: unseen * 0.3, bucket: UNSEEN_STANCE },
    { id: 'unseen-move', cls: 'blow', prior: unseen * 0.4, bucket: UNSEEN_MOVE },
  ];
}
