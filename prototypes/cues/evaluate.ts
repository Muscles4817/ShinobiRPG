import { cardId, type Card } from '@/systems/combat/engines/plan/cards';
import { statTier } from '@/systems/stats';

import type { DecisionPoint } from './collect';
import { concealment, DEFAULT_TUNING, type Tuning } from './observe';
import { infer, inView, type Prediction, type Reading } from './infer';
import { BROAD, classOf, cueProfile, telegraphClassOf, type CueClass } from './profile';
import { conditionsOf, today, type TodayRead } from './today';

/**
 * Scores the inference against the truth at every decision point, beside what today's telegraph
 * would have said there.
 */

export interface Scored {
  readonly point: DecisionPoint;
  readonly gap: number;
  /** The observer's perception against the actor's concealment of this card (the cue model's own "out-reads"). */
  readonly readMargin: number;
  /** The observer's grade in the art the true card is readied in. */
  readonly expertise: string;
  readonly truthClass: CueClass;
  readonly truthId: string;
  readonly nameable: boolean;
  readonly today: TodayRead;
  readonly cue: Prediction | null;
}

export function readingOf(p: DecisionPoint, tuning: Tuning = DEFAULT_TUNING): Reading {
  return {
    tuning,
    observer: p.observer,
    actor: p.actor,
    mind: { seenCards: p.seenCards, habits: p.habits, insight: p.insight },
    moment: { fight: p.fight, exchange: p.exchange },
    situation: {
      band: p.band,
      exchange: p.exchange,
      observerHidden: p.observerHidden,
      actorConfused: p.actorConfused,
      fieldUp: p.fieldUp,
    },
  };
}

function expertiseOf(p: DecisionPoint): string {
  const art = cueProfile(p.truth, p.actor).art;
  const value = art === 'body' ? p.observer.attributes.taijutsu : p.observer.attributes[art];
  return statTier(value).grade;
}

export function score(p: DecisionPoint, shown?: Card, tuning: Tuning = DEFAULT_TUNING): Scored {
  return {
    point: p,
    gap: p.observer.attributes.perception - p.actor.attributes.perception,
    readMargin:
      p.observer.attributes.perception -
      concealment(p.actor, cueProfile(p.truth, p.actor).art, tuning),
    expertise: expertiseOf(p),
    truthClass: classOf(p.truth),
    truthId: cardId(p.truth),
    nameable: p.truth.kind === 'jutsu' || p.truth.kind === 'item',
    today: today(p.observer, p.actor, p.insight, p.truth),
    cue: infer(readingOf(p, tuning), p.truth, shown),
  };
}

const pct = (n: number, d: number) => (d === 0 ? '–' : `${Math.round((100 * n) / d)}%`);

/** Exactly which card: a basic by its class, a technique or tool by its name. */
function cueExact(s: Scored): boolean {
  if (!s.cue) return false;
  return s.nameable ? s.cue.named === s.truthId : s.cue.predicted === s.truthClass;
}

function todayExact(s: Scored): boolean {
  return s.today.told && (!s.nameable || s.today.named);
}

/** One row of the main table. */
export function row(label: string, rows: readonly Scored[]): string {
  const n = rows.length;
  const seen = rows.filter((s) => s.cue);
  const told = rows.filter((s) => s.today.told).length;
  const classRight = seen.filter((s) => s.cue!.predicted === s.truthClass).length;
  const lineRight = seen.filter((s) => s.cue!.telegraph === telegraphClassOf(s.point.truth)).length;
  const broadRight = seen.filter((s) => BROAD[s.cue!.predicted] === BROAD[s.truthClass]).length;
  const nameable = rows.filter((s) => s.nameable);
  const named = seen.filter((s) => s.cue!.named);
  const namedWrong = named.filter((s) => s.cue!.named !== s.truthId).length;
  const todayNamed = nameable.filter((s) => s.today.named).length;
  const cueNamedRight = nameable.filter((s) => s.cue?.named === s.truthId).length;
  return [
    label,
    n,
    pct(told, n),
    pct(rows.filter(todayExact).length, n),
    pct(lineRight, n),
    pct(classRight, n),
    pct(broadRight, n),
    pct(rows.filter(cueExact).length, n),
    `${pct(todayNamed, nameable.length)} / ${pct(cueNamedRight, nameable.length)}`,
    pct(namedWrong, named.length),
  ].join(' | ');
}

export const ROW_HEADER =
  "bin | n | today: told | today: exact card | cue: today's class right | cue: fine class right | cue: broad right | cue: exact card | techniques named, today / cue | cue names wrong";

/** Confidence words against how often they are right. */
export function calibration(rows: readonly Scored[]): string[] {
  return (['sure', 'fairly sure', 'maybe'] as const).map((word) => {
    const said = rows.filter((s) => s.cue?.confidence === word);
    const right = said.filter((s) => s.cue!.predicted === s.truthClass).length;
    return `${word} | ${pct(said.length, rows.length)} | ${pct(right, said.length)}`;
  });
}

type Condition = 'foe-readying' | 'foe-attacking' | 'foe-closing';
const MASS: Readonly<Record<Condition, (p: Prediction) => number>> = {
  'foe-readying': (p) => p.pJutsu,
  'foe-attacking': (p) => p.pOffence,
  'foe-closing': (p) => p.pClosing,
};

/**
 * How a slot condition fires under inference at a threshold, against the truth (which today's
 * engine reads directly): how often it fires when true, and how often a firing is wrong.
 */
export function conditionRow(rows: readonly Scored[], cond: Condition, threshold: number): string {
  const visible = rows.filter((s) => inView(s.point.observer, s.point.actor));
  const truth = (s: Scored) => conditionsOf(s.point.truth)[cond];
  const fires = (s: Scored) => s.cue !== null && MASS[cond](s.cue) >= threshold;
  const trueRows = visible.filter(truth);
  const fired = visible.filter(fires);
  return [
    cond,
    threshold,
    pct(trueRows.length, visible.length),
    pct(trueRows.filter(fires).length, trueRows.length),
    pct(fired.filter((s) => !truth(s)).length, fired.length),
    pct(fired.length, visible.length),
  ].join(' | ');
}

export const CONDITION_HEADER =
  'condition | threshold | true (= today fires) | inference fires when true | inference firings wrong | inference fires';

export function gapBin(gap: number): string {
  if (gap <= -5) return 'a. ≤ -5';
  if (gap < 0) return 'b. -4..-1';
  if (gap === 0) return 'c. 0';
  if (gap < 5) return 'd. +1..+4';
  return 'e. ≥ +5';
}

export function groupBy<T>(items: readonly T[], key: (t: T) => string): [string, T[]][] {
  const out = new Map<string, T[]>();
  for (const item of items) {
    const k = key(item);
    out.set(k, [...(out.get(k) ?? []), item]);
  }
  return [...out.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

export function marginBin(m: number): string {
  if (m < -6) return 'a. < -6';
  if (m < -3) return 'b. -6..-3';
  if (m < 0) return 'c. -3..0';
  if (m < 3) return 'd. 0..3';
  if (m < 6) return 'e. 3..6';
  return 'f. ≥ 6';
}
