import { clamp, round1 } from '@/core';

import type { Aptitude } from './aptitude';
import { STAT_IDS, type StatDelta, type StatId, type Stats } from './stats';

/**
 * Natural limits. Some stats are given more than earned: speed and chakra reserves are mostly
 * born, strength is bounded by the frame, and the rest (stamina, the mind, the arts) are
 * trained. A stat's talent sets how far it can go as well as how fast: growth runs as usual up
 * to the limit, eases over its last stretch, and past it only trickles. Teachers get you to
 * your limit sooner; only a breakthrough (a `limitBonus`) moves it.
 *
 * The body and mind grow from where someone started (`docs/design/stat-model-plan.md`): a
 * graduate is grown, so speed has a step left in it, strength and stamina a couple of grades,
 * reserves more with use, and the mind a little with experience. Skills go as far as talent
 * takes them, wherever they began.
 */

export const STAT_KINDS = ['born', 'frame', 'trained'] as const;
export type StatKind = (typeof STAT_KINDS)[number];

export const STAT_KIND: Readonly<Record<StatId, StatKind>> = {
  strength: 'frame',
  speed: 'born',
  stamina: 'trained',
  reserves: 'born',
  chakraControl: 'trained',
  intellect: 'trained',
  perception: 'trained',
  willpower: 'trained',
  taijutsu: 'trained',
  ninjutsu: 'trained',
  genjutsu: 'trained',
  kenjutsu: 'trained',
  fuuinjutsu: 'trained',
};

export type Limits = Readonly<Record<StatId, number>>;

/** The limit at a few talents, joined by straight lines: [aptitude, limit]. */
type Curve = readonly (readonly [number, number])[];

/** Born and frame stats: most people top out at chūnin, the gifted at jōnin, prodigies at A. */
const NARROW_CURVE: Curve = [
  [0, 0],
  [0.5, 10],
  [1, 17],
  [1.3, 26],
  [1.6, 36],
  [1.8, 42],
];
/** Trained stats: generous; talent mostly sets the pace. */
const WIDE_CURVE: Curve = [
  [0, 0],
  [0.5, 20],
  [1, 32],
  [1.3, 44],
  [1.6, 60],
  [1.8, 70],
];

/** Past its limit a stat still grows at this share: years of work show, nobody outruns a frame. */
export const PAST_LIMIT_TRICKLE = 0.05;
/** Over this last stretch below a limit, growth eases down to the trickle. */
export const LIMIT_EASE = 3;
/** Each point of strength over the frame's comfortable level lowers the speed limit this much. */
export const BULK_SPEED_COST = 0.5;

function onCurve(curve: Curve, aptitude: number): number {
  let last: readonly [number, number] = [0, 0];
  for (const [x1, y1] of curve) {
    const [x0, y0] = last;
    if (aptitude <= x1) return x1 === x0 ? y1 : y0 + ((y1 - y0) * (aptitude - x0)) / (x1 - x0);
    last = [x1, y1];
  }
  return last[1];
}

/** How far a stat of this kind can go on this talent, from nothing (creatures, skills). */
export function limitOf(kind: StatKind, aptitude: number): number {
  const curve = kind === 'trained' ? WIDE_CURVE : NARROW_CURVE;
  return Math.round(onCurve(curve, Math.max(0, aptitude)));
}

/**
 * Room above a starting value per unit of talent: a share of the start (a stronger frame has
 * more to build on) and a fixed step. Ordinary talent (1) takes speed about one grade, strength
 * and stamina about two.
 */
interface Headroom {
  readonly share: number;
  readonly step: number;
}

const HEADROOM: Readonly<Partial<Record<StatId, Headroom>>> = {
  speed: { share: 0, step: 5 },
  strength: { share: 1.1, step: 0 },
  stamina: { share: 1, step: 0 },
  reserves: { share: 0, step: 14 },
  intellect: { share: 0, step: 4 },
  perception: { share: 0, step: 10 },
  willpower: { share: 0, step: 10 },
};

function limitFrom(id: StatId, aptitude: number, start: number | undefined): number {
  const room = HEADROOM[id];
  if (!room || start === undefined) return limitOf(STAT_KIND[id], aptitude);
  const talent = Math.max(0, aptitude);
  return round1(start + talent * (start * room.share + room.step));
}

/**
 * Every stat's limit from a talent, plus any breakthroughs and frame shifts. With `start` (the
 * stats someone began with) the body and mind grow from there; without it (a creature), every
 * stat is read from talent alone.
 */
export function limitsFor(aptitude: Aptitude, bonus: StatDelta = {}, start?: Stats): Limits {
  const entries = STAT_IDS.map((id) => {
    const natural = limitFrom(id, aptitude[id], start?.[id]);
    return [id, natural > 0 ? Math.max(0, natural + (bonus[id] ?? 0)) : 0] as const;
  });
  return Object.fromEntries(entries) as Record<StatId, number>;
}

/** Strength carried over what the frame is built for. */
export function bulk(stats: Stats, comfortStrength: number): number {
  return Math.max(0, stats.strength - comfortStrength);
}

/** The limits as they stand today: bulk on the frame pulls the speed limit down. */
export function effectiveLimits(limits: Limits, stats: Stats, comfortStrength?: number): Limits {
  if (comfortStrength === undefined) return limits;
  const slower = bulk(stats, comfortStrength) * BULK_SPEED_COST;
  return { ...limits, speed: Math.max(0, limits.speed - slower) };
}

/** Share of a session's gain that still lands at `value` against `limit`. */
export function limitFactor(value: number, limit: number): number {
  if (value >= limit) return PAST_LIMIT_TRICKLE;
  const easeFrom = limit - LIMIT_EASE;
  if (value <= easeFrom) return 1;
  const t = clamp((value - easeFrom) / LIMIT_EASE, 0, 1);
  return PAST_LIMIT_TRICKLE ** t;
}

/** How close a stat is to its limit, for the stat sheet: none, near, at. */
export type LimitRead = 'open' | 'near' | 'reached';

export function limitRead(value: number, limit: number): LimitRead {
  if (value >= limit) return 'reached';
  return value > limit - LIMIT_EASE ? 'near' : 'open';
}
