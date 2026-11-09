import type { MapPoint } from '@/content';
import type { JourneyPlan } from '@/systems/missions';
import type { RouteDef } from '@/systems/travel';

import type { GameContext } from '../context';

/**
 * Where a journey runs on the map: the road as one line in walking order, through each route's
 * bends, and where each leg starts and ends along it as a share of the whole. A route's length
 * is shared among its legs by their days. A stretch walked back after turning round starts
 * part-way down a route, so a stretch is matched to its route by the regions its legs cross,
 * not only by its ends.
 */

type PlanLeg = JourneyPlan['legs'][number];

/** One leg's place on the line, as shares of the whole road (0 at the start, 1 at the end). */
export interface LegSpan {
  readonly start: number;
  readonly end: number;
}

export interface JourneyPath {
  readonly points: readonly MapPoint[];
  readonly spans: readonly LegSpan[];
}

/** Consecutive legs from one place toward another: one route, or part of one. */
interface Stretch {
  readonly start: string;
  readonly toward: string;
  readonly legs: readonly PlanLeg[];
}

/** A route as walked from one end: its line and its legs in walking order. */
interface Oriented {
  readonly points: readonly MapPoint[];
  readonly legs: readonly { readonly region: string; readonly days: number }[];
}

function distance(a: MapPoint, b: MapPoint): number {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function lengthOf(points: readonly MapPoint[]): number {
  return points.slice(1).reduce((sum, p, i) => sum + distance(points[i] ?? p, p), 0);
}

/** The point `along` map units down a line (clamped to its ends). */
function pointAt(points: readonly MapPoint[], along: number): MapPoint {
  let left = along;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1];
    const b = points[i];
    if (!a || !b) continue;
    const step = distance(a, b);
    if (left <= step && step > 0) {
      const t = left / step;
      return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
    }
    left -= step;
  }
  return points.at(-1) ?? { x: 0, y: 0 };
}

/** The part of a line between two distances along it, bends included. */
function slice(points: readonly MapPoint[], from: number, to: number): MapPoint[] {
  const inside: MapPoint[] = [];
  let walked = 0;
  points.forEach((p, i) => {
    const before = points[i - 1];
    if (before) walked += distance(before, p);
    const bend = i > 0 && i < points.length - 1;
    if (bend && walked > from && walked < to) inside.push(p);
  });
  return [pointAt(points, from), ...inside, pointAt(points, to)];
}

function stretchesOf(plan: JourneyPlan): Stretch[] {
  const stretches: Stretch[] = [];
  let start = plan.from;
  for (const leg of plan.legs) {
    const toward = leg.toward ?? plan.to;
    const last = stretches.at(-1);
    if (last?.toward === toward && last.start === start) {
      stretches[stretches.length - 1] = { ...last, legs: [...last.legs, leg] };
    } else {
      stretches.push({ start, toward, legs: [leg] });
    }
    start = toward;
  }
  return stretches;
}

function orient(route: RouteDef, toward: string, ctx: GameContext): Oriented {
  const at = (id: string): MapPoint => {
    const { x, y } = ctx.content.locations.require(id).map;
    return { x, y };
  };
  const line = [at(route.from), ...(route.trail ?? []), at(route.to)];
  return route.to === toward
    ? { points: line, legs: route.legs }
    : { points: [...line].reverse(), legs: [...route.legs].reverse() };
}

const sameRegions = (a: readonly { region: string }[], b: readonly { region: string }[]) =>
  a.length === b.length && a.every((leg, i) => leg.region === b[i]?.region);

/**
 * The route a stretch walks, as walked, and whether the stretch is its last legs (a road walked
 * back from part-way down it) rather than its first. Null when no route fits.
 */
function routeOf(stretch: Stretch, ctx: GameContext): { way: Oriented; tail: boolean } | null {
  const ends = (r: RouteDef) => r.from === stretch.toward || r.to === stretch.toward;
  const ways = ctx.content.routes.all.filter(ends).map((r) => orient(r, stretch.toward, ctx));
  const midway = stretch.start === stretch.toward;
  const start = ctx.content.locations.require(stretch.start).map;
  const fits = (w: Oriented) => {
    const legs = midway ? w.legs.slice(-stretch.legs.length) : w.legs.slice(0, stretch.legs.length);
    const from = w.points[0];
    return sameRegions(legs, stretch.legs) && (midway || (from && distance(from, start) === 0));
  };
  const way = ways.find(fits);
  return way ? { way, tail: midway } : null;
}

/** A stretch's line and each of its legs' lengths, in map units. */
function stretchLine(
  stretch: Stretch,
  from: MapPoint,
  ctx: GameContext,
): { points: MapPoint[]; lengths: number[] } {
  const days = (legs: readonly { days: number }[]) => legs.reduce((sum, l) => sum + l.days, 0);
  const fitted = routeOf(stretch, ctx);
  const points = fitted?.way.points ?? [from, ctx.content.locations.require(stretch.toward).map];
  const routeLegs = fitted?.way.legs ?? stretch.legs;
  const total = lengthOf(points);
  const perDay = total / Math.max(1, days(routeLegs));
  const skipped = fitted?.tail ? routeLegs.length - stretch.legs.length : 0;
  const begin = days(routeLegs.slice(0, skipped)) * perDay;
  const lengths = stretch.legs.map((l) => l.days * perDay);
  const end = begin + lengths.reduce((sum, l) => sum + l, 0);
  return { points: slice(points, begin, end), lengths };
}

/** The whole road of a journey as one line, with each leg's span along it. */
export function journeyPath(plan: JourneyPlan, ctx: GameContext): JourneyPath {
  const points: MapPoint[] = [];
  const lengths: number[] = [];
  for (const stretch of stretchesOf(plan)) {
    const from = points.at(-1) ?? ctx.content.locations.require(stretch.start).map;
    const line = stretchLine(stretch, from, ctx);
    const joined = points.length > 0 ? line.points.slice(1) : line.points;
    points.push(...joined.map(({ x, y }) => ({ x, y })));
    lengths.push(...line.lengths);
  }
  const total = lengths.reduce((sum, l) => sum + l, 0);
  // A road with no length on the map (two places on one spot) is shared out by legs alike.
  const share = (l: number) => (total > 0 ? l / total : 1 / Math.max(1, lengths.length));
  let walked = 0;
  const spans = lengths.map((l) => {
    const start = walked;
    walked += share(l);
    return { start, end: walked };
  });
  return { points, spans };
}
