import type { PlanFighter } from '@/systems/combat/engines/plan/state';
import { hasVerb } from '@/systems/combat/rules/verbs';
import { statTier } from '@/systems/stats';

import { hashUnit } from './hash';
import { CHANNELS, rankIndex, type Channel, type CueArt, type CueProfile } from './profile';

/**
 * Step 2 of Part 5's cues: how clearly an observer sees each cue. Per channel, a margin: the
 * observer's perception (a sensor's and a fine controller's more for chakra) and the cue's
 * loudness, against the actor's concealment (their speed, and their skill in the art they ready
 * it in). Imperfect perception draws its noise from a hash of the fight, the exchange and the
 * pair, never the Rng: clear, glimpsed (possibly misread) or missed.
 */

/** How much a cue's loudness (0..1) moves the margin, about a middling cue (`MID_LOUDNESS`). */
export const SIGNAL = 12;
const MID_LOUDNESS = 0.5;

/**
 * How concealment is reckoned, and how noisy sight is. Two variants are benched:
 *  - `BODY_HIDES`: the actor's speed and skill in the art alone hide what they ready;
 *  - `WATCHFUL_HIDES`: a watchful fighter also knows their own tells, so the actor's perception
 *    hides as well, and "out-reading" a foe means what today's telegraph means by it.
 */
export interface Tuning {
  readonly name: string;
  /** Concealment per point of the actor's perception, speed, and skill in the art. */
  readonly concealPerception: number;
  readonly concealSpeed: number;
  readonly concealSkill: number;
  /** Added to every margin: where an even pair sits against the clear line. */
  readonly offset: number;
  /** The margin moves up to this much either way, by hash. */
  readonly noise: number;
  /** A margin at or above 0 is clear; down to -glimpseBand is a glimpse; below that, missed. */
  readonly glimpseBand: number;
}

export const BODY_HIDES: Tuning = {
  name: 'body hides',
  concealPerception: 0,
  concealSpeed: 0.55,
  concealSkill: 0.25,
  offset: 0,
  noise: 4,
  glimpseBand: 6,
};

export const WATCHFUL_HIDES: Tuning = {
  name: 'watchful hides',
  concealPerception: 0.7,
  concealSpeed: 0.2,
  concealSkill: 0.1,
  offset: 3,
  noise: 4,
  glimpseBand: 6,
};

export const DEFAULT_TUNING = WATCHFUL_HIDES;
/** Footwork is hidden by the body alone: speed counts, and taijutsu at this share. */
const BODY_SKILL_SHARE = 0.5;
/** A sensor reads chakra this much better; chakra control reads it a little better too. */
export const SENSOR_BONUS = 8;
const CONTROL_READ = 0.15;
/** A glimpse is misread this often (it shows another value of the channel). */
export const MISREAD = 0.2;
/** Seeing that a channel shows nothing takes attention as a cue of this loudness does. */
const NONE_STRENGTH = 0.45;
/** A feint's flare is thin: nothing is really being moulded. */
export const FEINT_FLARE = 0.5;

export type Quality = 'clear' | 'glimpse';

export interface Seen {
  readonly value: string;
  readonly quality: Quality;
}

/** What one observer took in of one readied card: per channel, a sight or nothing. */
export type Sighting = Readonly<Partial<Record<Channel, Seen>>>;

/** What the observer brings beyond their stats. */
export interface ObserverMind {
  /** Cards (ids) this observer has seen this actor play this fight. */
  readonly seenCards: readonly string[];
  /** Eyes that read everything: the actor's whole kit and intent. */
  readonly insight: boolean;
}

/** Where and when it is seen, for the hash. */
export interface Moment {
  readonly fight: string | number;
  readonly exchange: number;
}

const VOCAB: Readonly<Record<Exclude<Channel, 'form'>, readonly string[]>> = {
  body: ['forward', 'back', 'square', 'settle', 'coiled', 'light', 'none'],
  hands: ['seals', 'fist', 'blade', 'pouch', 'none'],
  chakra: ['flare', 'draw', 'none'],
  stillness: ['still', 'none'],
  eyes: ['fixed', 'scan', 'none'],
};

function skill(f: PlanFighter, art: CueArt): number {
  if (art === 'body') return f.attributes.taijutsu * BODY_SKILL_SHARE;
  return f.attributes[art];
}

export function concealment(actor: PlanFighter, art: CueArt, t: Tuning = DEFAULT_TUNING): number {
  const a = actor.attributes;
  return (
    t.concealPerception * a.perception +
    t.concealSpeed * a.speed +
    t.concealSkill * skill(actor, art) -
    t.offset
  );
}

export function isSensor(f: PlanFighter): boolean {
  return f.techniques.some((t) => hasVerb(t, 'sense'));
}

function readBonus(observer: PlanFighter, channel: Channel): number {
  if (channel !== 'chakra') return 0;
  const sensor = isSensor(observer) ? SENSOR_BONUS : 0;
  return sensor + CONTROL_READ * observer.attributes.chakraControl;
}

/** The margin by which an observer sees one channel, before noise. */
export function margin(
  observer: PlanFighter,
  actor: PlanFighter,
  profile: CueProfile,
  channel: Channel,
  t: Tuning = DEFAULT_TUNING,
): number {
  const cue = profile.cues[channel];
  const loud = cue.value === 'none' ? NONE_STRENGTH : cue.strength;
  return (
    observer.attributes.perception +
    readBonus(observer, channel) +
    SIGNAL * (loud - MID_LOUDNESS) -
    concealment(actor, profile.art, t)
  );
}

/** Whether an observer's eye in an art reads a technique of this rank's form by sight alone. */
export function expertIn(observer: PlanFighter, art: CueArt, rank: number): boolean {
  if (art === 'body') return false;
  return rankIndex(statTier(observer.attributes[art]).grade) >= rank;
}

interface Read {
  readonly observer: PlanFighter;
  readonly actor: PlanFighter;
  readonly mind: ObserverMind;
  readonly moment: Moment;
  readonly tuning?: Tuning;
}

function formSeen(read: Read, profile: CueProfile, feint: boolean): string {
  const shown = profile.cues.form.value;
  if (shown === 'none') return 'none';
  if (shown.startsWith('item:')) return shown;
  const expert = expertIn(read.observer, profile.art, profile.rank);
  // An expert reads a hollow sequence for what it is; anyone else sees the shape it copies.
  if (feint) return expert ? 'hollow' : familiar(read, shown) ? shown : 'unfamiliar';
  return expert || familiar(read, shown) ? shown : 'unfamiliar';
}

/**
 * A form read clearly is recognised, found unfamiliar, or (by an expert, in a feint) hollow. A
 * glimpse of a form is recognised only when it is familiar: a shape seen before.
 */
function formSighting(
  read: Read,
  profile: CueProfile,
  feint: boolean,
  quality: Quality,
): Seen | null {
  if (quality === 'clear') return { value: formSeen(read, profile, feint), quality };
  const shown = profile.cues.form.value;
  return shown !== 'none' && familiar(read, shown) ? { value: shown, quality } : null;
}

function familiar(read: Read, id: string): boolean {
  if (read.mind.seenCards.includes(id)) return true;
  return read.observer.techniques.some((t) => `jutsu:${t.id}` === id);
}

function misread(channel: Exclude<Channel, 'form'>, value: string, draw: number): string {
  const base = value.split(':')[0]!;
  const others = VOCAB[channel].filter((v) => v !== base);
  return others[Math.floor(draw * others.length)] ?? base;
}

function channelSeen(
  read: Read,
  profile: CueProfile,
  channel: Channel,
  feint: boolean,
): Seen | null {
  const key = [read.moment.fight, read.moment.exchange, read.observer.id, read.actor.id, channel];
  const t = read.tuning ?? DEFAULT_TUNING;
  const noise = (hashUnit(...key, 'noise') * 2 - 1) * t.noise;
  const thin = feint && channel === 'chakra' ? FEINT_FLARE : 1;
  const scaled = { ...profile.cues[channel], strength: profile.cues[channel].strength * thin };
  const shown = { ...profile, cues: { ...profile.cues, [channel]: scaled } };
  const at = margin(read.observer, read.actor, shown, channel, t) + noise;
  if (at < -t.glimpseBand) return null;
  const quality: Quality = at >= 0 ? 'clear' : 'glimpse';
  if (channel === 'form') return formSighting(read, profile, feint, quality);
  const value = profile.cues[channel].value;
  if (quality === 'clear') return { value, quality };
  const plain = value.split(':')[0]!;
  const wrong = hashUnit(...key, 'misread') < MISREAD;
  return { value: wrong ? misread(channel, value, hashUnit(...key, 'which')) : plain, quality };
}

/**
 * What an observer sees of a readied card's cues. `feint`: the profile shown is another card's,
 * worn by an actor who isn't really readying it (its flare thin, its form hollow).
 */
export function observe(read: Read, profile: CueProfile, feint = false): Sighting {
  const out: Partial<Record<Channel, Seen>> = {};
  for (const channel of CHANNELS) {
    const seen = channelSeen(read, profile, channel, feint);
    if (seen) out[channel] = seen;
  }
  return out;
}
