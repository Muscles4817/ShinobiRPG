import {
  cardId,
  findCard,
  fitsBand,
  isOffence,
  type Card,
} from '@/systems/combat/engines/plan/cards';
import type { PlanFighter } from '@/systems/combat/engines/plan/state';
import type { RangeBand } from '@/systems/combat/contract';
import { seesTheHidden } from '@/systems/combat/rules/eyes';
import { statTier } from '@/systems/stats';

import {
  expertIn,
  observe,
  type Moment,
  type ObserverMind,
  type Sighting,
  type Tuning,
} from './observe';
import {
  CHANNELS,
  classOf,
  cueProfile,
  rankIndex,
  type Channel,
  type CueClass,
  type CueProfile,
  telegraphClassOf,
  type TelegraphClass,
} from './profile';

/**
 * Step 3 of Part 5's cues: what the observer makes of what they saw. A posterior over the cards
 * the observer could think of (the basics anyone has, the cards seen from this actor so far,
 * whatever form they recognised, and two buckets for "something not seen yet"), each weighted by
 * habit and times the likelihood of the sighting under its cue profile. Expertise in a card's art
 * sharpens the likelihood. The result is a class with a confidence word, and a name only when
 * the evidence is strong.
 */

/** A clear sight that doesn't match a card leaves it this likely; an expert's sight, less. */
export const EPS_CLEAR = 0.1;
const EXPERT_SHARPEN = 0.4;
/** A glimpse is weak evidence: a mismatch leaves at least this much. */
export const EPS_GLIMPSE = 0.45;
/** A clearly read form that isn't this card's. */
const EPS_FORM = 0.03;
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
export const HABIT = 0.6;
/** A card seen from this actor, before any habit. */
const SEEN_PRIOR = 0.5;
/** "Something I haven't seen": strong at the start, fading as the fight goes on. */
export const UNSEEN_PRIOR = 0.8;
const UNSEEN_DECAY = 4;
/** A sharp mind keeps a feint in mind; a hollow form makes it the likeliest thing. */
export const FEINT_PRIOR = 0.08;
const HOLLOW_LIFT = 40;
/** Class mass for each confidence word, and a card's for its name. */
export const SURE = 0.9;
export const FAIRLY = 0.65;
export const NAME_AT = 0.6;

export type Confidence = 'sure' | 'fairly sure' | 'maybe';

export interface Prediction {
  readonly predicted: CueClass;
  readonly confidence: Confidence;
  readonly classMass: number;
  /** The same read at today's telegraph's grain (what its class line tells apart). */
  readonly telegraph: TelegraphClass;
  /** The card named, when the evidence is strong enough (a technique or a tool). */
  readonly named?: string;
  /** The top hypothesis is a feint. */
  readonly feint: boolean;
  /** Mass on: a jutsu, an attack, a step in (what slot conditions key on). */
  readonly pJutsu: number;
  readonly pOffence: number;
  readonly pClosing: number;
}

export interface Situation {
  readonly band: RangeBand;
  readonly exchange: number;
  /** The observer is hiding (a Search becomes likely); the actor is confused (a Dispel). */
  readonly observerHidden: boolean;
  readonly actorConfused: boolean;
  /** A field (mist, smoke) is over the fight: a Dispel becomes likely. */
  readonly fieldUp: boolean;
}

export interface Reading {
  readonly observer: PlanFighter;
  readonly actor: PlanFighter;
  readonly mind: ObserverMind & { readonly habits: Readonly<Record<string, number>> };
  readonly moment: Moment;
  readonly situation: Situation;
  readonly tuning?: Tuning;
}

interface Hypothesis {
  readonly id: string;
  readonly cls: CueClass;
  readonly tcls: TelegraphClass;
  readonly prior: number;
  readonly jutsu: number;
  readonly offence: number;
  readonly profile?: CueProfile;
  readonly bucket?: Bucket;
}

type Bucket = Readonly<Record<Channel, Readonly<Record<string, number>>>>;
const ANY = 0.5;

const UNSEEN_TECHNIQUE: Bucket = {
  body: { coiled: 0.1 },
  hands: { seals: 1, fist: 0.3, blade: 0.3, pouch: 0.05, none: 0.3 },
  chakra: { flare: 1, draw: 0.1, none: 0.3 },
  stillness: { still: 0.3, none: 1 },
  eyes: { fixed: 1, scan: 0.1, none: 0.6 },
  form: { unfamiliar: 1, hollow: 0.2, none: 0.05 },
};
/** A counter stance not seen yet: coiled, waiting. */
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

function basicPrior(id: string, card: Card, s: Situation): number {
  if (id === 'search' && !s.observerHidden) return 0;
  // A Dispel breaks an illusion: one on them, a field, or the one you hide in.
  if (id === 'dispel' && !s.actorConfused && !s.fieldUp && !s.observerHidden) return 0;
  return BASIC_PRIOR[classOf(card)] ?? 0;
}

function cardHypothesis(r: Reading, card: Card, prior: number): Hypothesis {
  const id = cardId(card);
  const habit = (r.mind.habits[id] ?? 0) * HABIT;
  return {
    id,
    cls: classOf(card),
    tcls: telegraphClassOf(card),
    prior: prior + habit,
    jutsu: card.kind === 'jutsu' ? 1 : 0,
    offence: isOffence(card) ? 1 : 0,
    profile: cueProfile(card, r.actor),
  };
}

function candidates(r: Reading, sighting: Sighting): Hypothesis[] {
  const { actor, situation: s } = r;
  const out = new Map<string, Hypothesis>();
  const add = (card: Card | null, prior: number) => {
    if (!card || !fitsBand(card, s.band) || prior <= 0) return;
    const h = cardHypothesis(r, card, prior);
    if (!out.has(h.id)) out.set(h.id, h);
  };
  for (const id of BASIC_IDS) {
    const card = findCard(actor, id);
    if (card) add(card, basicPrior(id, card, s));
  }
  for (const id of r.mind.seenCards) add(findCard(actor, id), SEEN_PRIOR);
  const unseen = UNSEEN_PRIOR / (1 + s.exchange / UNSEEN_DECAY);
  const form = sighting.form?.value;
  // A form recognised but never seen from them: the unseen thing, revealed.
  if (form && form !== 'none' && form !== 'unfamiliar' && form !== 'hollow')
    add(findCard(actor, form), unseen);
  const hyps = [...out.values()];
  hyps.push({
    id: 'unseen-technique',
    cls: 'technique',
    tcls: 'jutsu',
    prior: unseen,
    jutsu: 1,
    offence: 0.75,
    bucket: UNSEEN_TECHNIQUE,
  });
  hyps.push({
    id: 'unseen-stance',
    cls: 'stance',
    tcls: 'stance',
    prior: unseen * 0.3,
    jutsu: 1,
    offence: 0,
    bucket: UNSEEN_STANCE,
  });
  hyps.push({
    id: 'unseen-move',
    cls: 'blow',
    tcls: 'strike',
    prior: unseen * 0.4,
    jutsu: 1,
    offence: 1,
    bucket: UNSEEN_MOVE,
  });
  return hyps;
}

function sharpMind(f: PlanFighter): boolean {
  return rankIndex(statTier(f.attributes.intellect, 'mind').grade) >= 2;
}

function familiarForm(r: Reading, h: Hypothesis): boolean {
  if (!h.profile) return false;
  const form = h.profile.cues.form.value;
  if (form === 'none') return true;
  if (form.startsWith('item:')) return true;
  return (
    r.mind.seenCards.includes(form) ||
    expertIn(r.observer, h.profile.art, h.profile.rank) ||
    r.observer.techniques.some((t) => `jutsu:${t.id}` === form)
  );
}

function cardChannel(
  r: Reading,
  h: Hypothesis,
  channel: Channel,
  seen: { value: string; quality: string },
): number {
  const profile = h.profile!;
  const own = profile.cues[channel].value;
  if (channel === 'form') {
    if (seen.value === own) return 1;
    if (seen.quality === 'glimpse') return EPS_GLIMPSE / 2;
    // Unfamiliar: a card whose form they'd have known is unlikely; one they wouldn't, as likely.
    if (seen.value === 'unfamiliar') return familiarForm(r, h) ? EPS_FORM * 2 : 1;
    return EPS_FORM;
  }
  const glimpse = seen.quality === 'glimpse';
  const matches = glimpse ? own.split(':')[0] === seen.value : own === seen.value;
  if (matches) return 1;
  // A flare of the wrong element is half a match.
  if (!glimpse && own.startsWith('flare') && seen.value.startsWith('flare')) return 0.3;
  if (glimpse) return EPS_GLIMPSE;
  return expertIn(r.observer, profile.art, profile.rank) ? EPS_CLEAR * EXPERT_SHARPEN : EPS_CLEAR;
}

function bucketChannel(
  bucket: Bucket,
  channel: Channel,
  seen: { value: string; quality: string },
): number {
  const base = seen.value.split(':')[0]!;
  const l = bucket[channel][base] ?? (channel === 'form' ? EPS_FORM : ANY);
  return seen.quality === 'glimpse' ? Math.max(l, EPS_GLIMPSE) : l;
}

function likelihood(r: Reading, h: Hypothesis, sighting: Sighting): number {
  let l = 1;
  for (const channel of CHANNELS) {
    const seen = sighting[channel];
    if (!seen) continue;
    l *= h.bucket ? bucketChannel(h.bucket, channel, seen) : cardChannel(r, h, channel, seen);
  }
  return l;
}

function confidenceOf(mass: number): Confidence {
  if (mass >= SURE) return 'sure';
  return mass >= FAIRLY ? 'fairly sure' : 'maybe';
}

function insightRead(card: Card): Prediction {
  const offence = isOffence(card) ? 1 : 0;
  const named = card.kind === 'jutsu' || card.kind === 'item' ? { named: cardId(card) } : {};
  return {
    predicted: classOf(card),
    confidence: 'sure',
    classMass: 1,
    telegraph: telegraphClassOf(card),
    feint: false,
    pJutsu: card.kind === 'jutsu' ? 1 : 0,
    pOffence: offence,
    pClosing: card.kind === 'step' && card.direction === 'in' ? 1 : 0,
    ...named,
  };
}

/** Whether the observer can read the actor at all: a hider gives nothing to eyes that don't see them. */
export function inView(observer: PlanFighter, actor: PlanFighter): boolean {
  return !actor.hidden || seesTheHidden(observer);
}

/** What the observer infers from a sighting. */
export function inferFrom(r: Reading, sighting: Sighting): Prediction {
  const hyps = candidates(r, sighting);
  const weights = hyps.map((h) => h.prior * likelihood(r, h, sighting));
  const best = Math.max(...weights);
  const hollow = sighting.form?.value === 'hollow';
  const feintWeight = sharpMind(r.observer) ? FEINT_PRIOR * best * (hollow ? HOLLOW_LIFT : 1) : 0;
  const total = weights.reduce((a, b) => a + b, 0) + feintWeight;
  const classes = new Map<CueClass, number>();
  const lines = new Map<TelegraphClass, number>();
  let pJutsu = 0;
  let pOffence = 0;
  let pClosing = 0;
  let top = { id: '', mass: 0 };
  hyps.forEach((h, i) => {
    const p = weights[i]! / total;
    classes.set(h.cls, (classes.get(h.cls) ?? 0) + p);
    lines.set(h.tcls, (lines.get(h.tcls) ?? 0) + p);
    pJutsu += p * h.jutsu;
    pOffence += p * h.offence;
    if (h.id === 'step-in') pClosing += p;
    if (p > top.mass) top = { id: h.id, mass: p };
  });
  const [predicted, classMass] = [...classes.entries()].sort((a, b) => b[1] - a[1])[0]!;
  const telegraph = [...lines.entries()].sort((a, b) => b[1] - a[1])[0]![0];
  const feint = feintWeight / total > classMass;
  // A name needs the form itself in sight, not habit alone: otherwise it is a class.
  const formSeen = sighting.form?.value === top.id;
  const nameable = (top.id.startsWith('jutsu:') || top.id.startsWith('item:')) && formSeen;
  return {
    predicted,
    confidence: confidenceOf(classMass),
    classMass,
    telegraph,
    feint,
    pJutsu,
    pOffence,
    pClosing,
    ...(nameable && top.mass >= NAME_AT ? { named: top.id } : {}),
  };
}

/**
 * The whole read: insight sees the card; a hidden actor gives nothing; anyone else infers from
 * the cues. `shown`: a feint, the card whose cues the actor wears instead.
 */
export function infer(r: Reading, truth: Card, shown?: Card): Prediction | null {
  if (!inView(r.observer, r.actor)) return null;
  if (r.mind.insight) return insightRead(truth);
  const profile = cueProfile(shown ?? truth, r.actor);
  const sighting = observe(r, profile, shown !== undefined);
  return inferFrom(r, sighting);
}
