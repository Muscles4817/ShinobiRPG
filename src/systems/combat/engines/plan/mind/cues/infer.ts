import { expertIn, familiar, type Read, type Seen, type Sighting } from './observe';
import { candidates, type Bucket, type Hypothesis, type Situation } from './hypotheses';
import { CHANNELS, type Channel, type CueClass, type CueProfile } from './profile';

/**
 * Step 3 of the cues (`docs/design/combat-ai-plan.md` Part 5): what the observer makes of what
 * they saw. Each hypothesis (`hypotheses.ts`) is weighed by its prior times the likelihood of the
 * sighting under its cue profile, expertise in the card's art sharpening it. Out comes a class
 * with a confidence word, and a name only when the top card carries the evidence and its form
 * was actually seen: habit alone never names.
 */

/** A clear sight that doesn't match a card leaves it this likely; an expert's sight, less. */
const EPS_CLEAR = 0.1;
const EXPERT_SHARPEN = 0.4;
/** A glimpse is weak evidence: a mismatch leaves at least this much. */
const EPS_GLIMPSE = 0.45;
/** A clearly read form that isn't this card's. */
const EPS_FORM = 0.03;
/** A bucket's likelihood for a value it doesn't list. */
const ANY = 0.5;
/** Class mass for each confidence word, and a card's for its name. */
const SURE = 0.9;
const FAIRLY = 0.65;
const NAME_AT = 0.6;

export type Confidence = 'sure' | 'fairly sure' | 'maybe';

export interface Prediction {
  readonly predicted: CueClass;
  readonly confidence: Confidence;
  /** The card named (a technique or a tool), when the evidence carries one. */
  readonly named?: string;
}

export type Reading = Read & {
  readonly habits: Readonly<Record<string, number>>;
  readonly situation: Situation;
};

function familiarForm(read: Reading, profile: CueProfile): boolean {
  const form = profile.cues.form.value;
  if (form === 'none' || form.startsWith('item:')) return true;
  return expertIn(read.observer, profile.art, profile.rank) || familiar(read, form);
}

function formLikelihood(read: Reading, profile: CueProfile, seen: Seen): number {
  if (seen.value === profile.cues.form.value) return 1;
  if (seen.quality === 'glimpse') return EPS_GLIMPSE / 2;
  // Unfamiliar: a card whose form they'd have known is unlikely; one they wouldn't, as likely.
  if (seen.value === 'unfamiliar') return familiarForm(read, profile) ? EPS_FORM * 2 : 1;
  return EPS_FORM;
}

function cardChannel(read: Reading, profile: CueProfile, channel: Channel, seen: Seen): number {
  if (channel === 'form') return formLikelihood(read, profile, seen);
  const own = profile.cues[channel].value;
  const glimpse = seen.quality === 'glimpse';
  if (glimpse ? own.split(':')[0] === seen.value : own === seen.value) return 1;
  // A flare of the wrong element is half a match.
  if (!glimpse && own.startsWith('flare') && seen.value.startsWith('flare')) return 0.3;
  if (glimpse) return EPS_GLIMPSE;
  return expertIn(read.observer, profile.art, profile.rank)
    ? EPS_CLEAR * EXPERT_SHARPEN
    : EPS_CLEAR;
}

function bucketChannel(bucket: Bucket, channel: Channel, seen: Seen): number {
  const base = seen.value.split(':')[0] ?? seen.value;
  const l = bucket[channel][base] ?? (channel === 'form' ? EPS_FORM : ANY);
  return seen.quality === 'glimpse' ? Math.max(l, EPS_GLIMPSE) : l;
}

function likelihood(read: Reading, h: Hypothesis, sighting: Sighting): number {
  let l = 1;
  for (const channel of CHANNELS) {
    const seen = sighting[channel];
    if (!seen) continue;
    if (h.bucket) l *= bucketChannel(h.bucket, channel, seen);
    else if (h.profile) l *= cardChannel(read, h.profile, channel, seen);
  }
  return l;
}

function confidenceOf(mass: number): Confidence {
  if (mass >= SURE) return 'sure';
  return mass >= FAIRLY ? 'fairly sure' : 'maybe';
}

/** What the observer infers from a sighting. */
export function inferFrom(read: Reading, sighting: Sighting): Prediction {
  const hyps = candidates(read, sighting, read.situation);
  const weights = hyps.map((h) => h.prior * likelihood(read, h, sighting));
  const total = weights.reduce((a, b) => a + b, 0) || 1;
  const classes = new Map<CueClass, number>();
  let top = { id: '', mass: 0 };
  hyps.forEach((h, i) => {
    const p = (weights[i] ?? 0) / total;
    classes.set(h.cls, (classes.get(h.cls) ?? 0) + p);
    if (p > top.mass) top = { id: h.id, mass: p };
  });
  const [predicted, mass] = [...classes.entries()].sort((a, b) => b[1] - a[1])[0] ?? [
    'blow' as const,
    0,
  ];
  const nameable =
    (top.id.startsWith('jutsu:') || top.id.startsWith('item:')) &&
    sighting.form?.value === top.id &&
    top.mass >= NAME_AT;
  return { predicted, confidence: confidenceOf(mass), ...(nameable ? { named: top.id } : {}) };
}
