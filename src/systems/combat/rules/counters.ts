import { clamp } from '@/core';

import type { CombatAttributes } from '../contract';
import { gapRatio } from './damage';
import type { Approach } from './tags';

/**
 * Counters (`docs/design/defence-plan.md`, the counter system): an action slotted and played like
 * Evade or Brace, spending the turn waiting for an attack and holding until the fighter's next
 * turn. A counter waits for one kind of attack, read from how it comes (`rules/tags/approach.ts`):
 * a blow or a grab turned round with bare hands up close, a blade parried with a weapon in hand,
 * thrown steel knocked down and thrown back, eyes looked away from. It answers the first such
 * attack, by a read: the defender's eyes and wits against the attacker's speed and the skill
 * behind it, far more decisive than a dodge's read. A clean read stops the attack and answers it;
 * a late one turns it aside with nothing back; a wrong one leaves the defender fully open, every
 * ready defence down. An attack that commits its user (a charge, a Chidori) is easier to read and
 * pays more for it. Nothing that comes and isn't waited for costs anything but the turn.
 */

/** What a counter waits for. */
export const COUNTER_WAITS = ['blow', 'blade', 'thrown', 'eyes'] as const;
export type CounterWaits = (typeof COUNTER_WAITS)[number];

/** The counter's card and commitment id, by what it waits for. */
export const COUNTER_IDS = {
  blow: 'counter',
  blade: 'counter-blade',
  thrown: 'counter-thrown',
  eyes: 'look-away',
} as const satisfies Readonly<Record<CounterWaits, string>>;
export type CounterId = (typeof COUNTER_IDS)[CounterWaits];

/** The ways of coming each counter answers (eyes: only an illusion through eye contact). */
const ANSWERS: Readonly<Record<CounterWaits, readonly Approach[]>> = {
  blow: ['blow', 'grab'],
  blade: ['blade'],
  thrown: ['thrown'],
  eyes: ['mind'],
};

export function waitsFor(waits: CounterWaits, came: Approach): boolean {
  return ANSWERS[waits].includes(came);
}

/** Which counter an id names, or null for anything else. */
export function counterWaitsOf(id: string | null | undefined): CounterWaits | null {
  return COUNTER_WAITS.find((w) => COUNTER_IDS[w] === id) ?? null;
}

/** Breath spent waiting: looking away is only a choice of where to look. */
export const COUNTER_BREATH: Readonly<Record<CounterWaits, number>> = {
  blow: 5,
  blade: 5,
  thrown: 4,
  eyes: 2,
};

/** A clean read between equals, and the bounds it is held within. */
const CLEAN_BASE = 0.45;
const CLEAN_MIN = 0.08;
const CLEAN_MAX = 0.85;
/** How decisive the read is: the gap between eyes and the attack, sharpened. */
const READ_EXPONENT = 0.8;
/** An attack that commits its user is read this much more easily. */
export const OPENS_READ = 1.5;
/** Of the reads that aren't clean, the share still turns the attack aside (between equals). */
const LATE_SHARE = 0.35;
/** A committed attack answered cleanly takes this much more back. */
export const OPENS_ANSWER = 1.5;
/** An answer's force, as a share of the defender's own strike (thrown steel lighter). */
export const ANSWER_SCALE: Readonly<Record<CounterWaits, number>> = {
  blow: 0.9,
  blade: 1,
  thrown: 0.6,
  eyes: 0,
};

interface Minds {
  readonly attributes: CombatAttributes;
}

/** What a counter reads with (eyes and wits) and what it reads against (speed and skill). */
export interface CounterRead {
  readonly defender: Minds;
  readonly attacker: Minds;
  /** The skill behind the attack. */
  readonly skill: number;
  /** The attack commits its user (`Execution.opensUser`). */
  readonly opens: boolean;
  /** How much more easily it is read for being familiar, else 1. */
  readonly familiar?: number;
}

/** The chance of a clean read, and of a late one that still turns it aside. */
export function counterOdds(r: CounterRead): { readonly clean: number; readonly late: number } {
  const eyes = (r.defender.attributes.perception + r.defender.attributes.intellect) / 2;
  const tell = (r.attacker.attributes.speed + r.skill) / 2;
  const read = gapRatio(eyes, tell) ** READ_EXPONENT * (r.familiar ?? 1);
  const clean = clamp(CLEAN_BASE * read * (r.opens ? OPENS_READ : 1), CLEAN_MIN, CLEAN_MAX);
  // A late save comes from reading it at all: the poorer the read, the rarer.
  return { clean, late: (1 - clean) * LATE_SHARE * Math.min(1, read) };
}

export type CounterOutcome = 'clean' | 'late' | 'missed';

/** How a counter went, from its odds and a roll in [0, 1). */
export function counterOutcome(odds: ReturnType<typeof counterOdds>, roll: number): CounterOutcome {
  if (roll < odds.clean) return 'clean';
  return roll < odds.clean + odds.late ? 'late' : 'missed';
}
