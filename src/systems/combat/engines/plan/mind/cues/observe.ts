import { hashUnit } from '@/core';
import { statTier } from '@/systems/stats';

import { hasVerb } from '../../../../rules/verbs';
import type { PlanFighter } from '../../state';
import { CHANNELS, rankIndex, type Channel, type CueArt, type CueProfile } from './profile';

/**
 * Step 2 of the cues (`docs/design/combat-ai-plan.md` Part 5): how clearly an observer sees each
 * cue. Per channel, a margin: the observer's perception (a sensor's and a fine controller's more
 * for chakra) and the cue's loudness, against the actor's concealment, which is mostly their own
 * perception (a watchful fighter knows what gives them away), some speed and a little skill in
 * the art. The noise is a hash of the moment and the pair, never the Rng: clear, glimpsed
 * (possibly misread) or missed.
 */

/** How much a cue's loudness (0..1) moves the margin, about a middling cue. */
const SIGNAL = 12;
const MID_LOUDNESS = 0.5;
/** Concealment per point of the actor's perception, speed and skill in the art. */
const CONCEAL_PERCEPTION = 0.7;
const CONCEAL_SPEED = 0.2;
const CONCEAL_SKILL = 0.1;
/** Where an even pair sits against the clear line. */
const OFFSET = 3;
/** The margin moves up to this much either way, by hash. */
const NOISE = 4;
/** A margin at or above 0 is clear; down to -GLIMPSE_BAND a glimpse; below, missed. */
const GLIMPSE_BAND = 6;
/** Footwork is hidden by the body alone: taijutsu counts at this share. */
const BODY_SKILL_SHARE = 0.5;
/** A sensor reads chakra this much better; chakra control reads it a little better too. */
const SENSOR_BONUS = 8;
const CONTROL_READ = 0.15;
/** A glimpse is misread this often (it shows another value of the channel). */
const MISREAD = 0.2;
/** Seeing that a channel shows nothing takes attention as a cue of this loudness does. */
const NONE_STRENGTH = 0.45;

export type Quality = 'clear' | 'glimpse';

export interface Seen {
  readonly value: string;
  readonly quality: Quality;
}

/** What one observer took in of one readied card: per channel, a sight or nothing. */
export type Sighting = Readonly<Partial<Record<Channel, Seen>>>;

/** Who reads whom, when, and what the observer has seen of the actor before. */
export interface Read {
  readonly observer: PlanFighter;
  readonly actor: PlanFighter;
  /** Cards (ids) the observer has seen the actor play this fight. */
  readonly seenCards: readonly string[];
  /** The moment, for the hash: the same moment and pair always see the same thing. */
  readonly moment: readonly (string | number)[];
}

const VOCAB: Readonly<Record<Exclude<Channel, 'form'>, readonly string[]>> = {
  body: ['forward', 'back', 'square', 'settle', 'coiled', 'light', 'none'],
  hands: ['seals', 'fist', 'blade', 'pouch', 'none'],
  chakra: ['flare', 'draw', 'none'],
  stillness: ['still', 'none'],
  eyes: ['fixed', 'scan', 'none'],
};

function skill(f: PlanFighter, art: CueArt): number {
  return art === 'body' ? f.attributes.taijutsu * BODY_SKILL_SHARE : f.attributes[art];
}

function concealment(actor: PlanFighter, art: CueArt): number {
  const a = actor.attributes;
  return (
    CONCEAL_PERCEPTION * a.perception +
    CONCEAL_SPEED * a.speed +
    CONCEAL_SKILL * skill(actor, art) -
    OFFSET
  );
}

function readBonus(observer: PlanFighter, channel: Channel): number {
  if (channel !== 'chakra') return 0;
  const sensor = observer.techniques.some((t) => hasVerb(t, 'sense')) ? SENSOR_BONUS : 0;
  return sensor + CONTROL_READ * observer.attributes.chakraControl;
}

function margin(read: Read, profile: CueProfile, channel: Channel): number {
  const cue = profile.cues[channel];
  const loud = cue.value === 'none' ? NONE_STRENGTH : cue.strength;
  return (
    read.observer.attributes.perception +
    readBonus(read.observer, channel) +
    SIGNAL * (loud - MID_LOUDNESS) -
    concealment(read.actor, profile.art)
  );
}

/** Whether an observer's eye in an art reads a technique of this rank's form by sight alone. */
export function expertIn(observer: PlanFighter, art: CueArt, rank: number): boolean {
  if (art === 'body') return false;
  return rankIndex(statTier(observer.attributes[art]).grade) >= rank;
}

/** A form the observer has met: seen from this actor, or one of their own techniques. */
export function familiar(read: Pick<Read, 'observer' | 'seenCards'>, id: string): boolean {
  return (
    read.seenCards.includes(id) || read.observer.techniques.some((t) => `jutsu:${t.id}` === id)
  );
}

/** A form read clearly is recognised or unfamiliar; a glimpse of one only if it is familiar. */
function formSighting(read: Read, profile: CueProfile, quality: Quality): Seen | null {
  const shown = profile.cues.form.value;
  if (quality === 'glimpse')
    return shown !== 'none' && familiar(read, shown) ? { value: shown, quality } : null;
  if (shown === 'none' || shown.startsWith('item:')) return { value: shown, quality };
  const known = expertIn(read.observer, profile.art, profile.rank) || familiar(read, shown);
  return { value: known ? shown : 'unfamiliar', quality };
}

function misread(channel: Exclude<Channel, 'form'>, value: string, draw: number): string {
  const base = value.split(':')[0] ?? value;
  const others = VOCAB[channel].filter((v) => v !== base);
  return others[Math.floor(draw * others.length)] ?? base;
}

function channelSeen(read: Read, profile: CueProfile, channel: Channel): Seen | null {
  const key = [...read.moment, read.observer.id, read.actor.id, channel];
  const noise = (hashUnit(...key, 'noise') * 2 - 1) * NOISE;
  const at = margin(read, profile, channel) + noise;
  if (at < -GLIMPSE_BAND) return null;
  const quality: Quality = at >= 0 ? 'clear' : 'glimpse';
  if (channel === 'form') return formSighting(read, profile, quality);
  const value = profile.cues[channel].value;
  if (quality === 'clear') return { value, quality };
  const plain = value.split(':')[0] ?? value;
  const wrong = hashUnit(...key, 'misread') < MISREAD;
  return { value: wrong ? misread(channel, value, hashUnit(...key, 'which')) : plain, quality };
}

/** What an observer sees of a readied card's cues. */
export function observe(read: Read, profile: CueProfile): Sighting {
  const out: Partial<Record<Channel, Seen>> = {};
  for (const channel of CHANNELS) {
    const seen = channelSeen(read, profile, channel);
    if (seen) out[channel] = seen;
  }
  return out;
}
