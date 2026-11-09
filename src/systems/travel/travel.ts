import { DANGERS, type Danger } from '@/systems/missions';
import type { Rank } from '@/systems/standing';

/**
 * The roads between locations, and the way from one to another. A route joins two locations
 * both ways; its legs are stretches of days through a region (so the road's events fit the
 * land). A journey is the quickest open path: fewest days, then least ryo.
 */

export interface RouteLeg {
  /** Road-event region, e.g. `coast-road`. */
  readonly region: string;
  readonly days: number;
  /** The stretch in a line, true whichever way you walk it. */
  readonly text: string;
}

/** Surfaces a shinobi may learn to walk on with chakra, where a road crosses one. */
export const WALK_SURFACES = ['water', 'trees'] as const;
export type WalkSurface = (typeof WALK_SURFACES)[number];

/**
 * What a road asks of whoever walks it: a rank (a pass only officers use), something the
 * village remembers (a ferry that runs once you've earned it) or a surface walked on chakra.
 * Whether a traveller meets one is the game's question, not this module's.
 */
export type RouteNeed =
  | { readonly kind: 'rank'; readonly rank: Rank }
  | {
      readonly kind: 'worldMark';
      readonly mark: string;
      /** What opens it, as a phrase after "needs": "the harbourmaster's trust". */
      readonly text: string;
    }
  | { readonly kind: 'walk'; readonly surface: WalkSurface };

export interface RouteDef {
  readonly id: string;
  readonly from: string;
  readonly to: string;
  /** In order from `from` to `to`. */
  readonly legs: readonly RouteLeg[];
  /** The worst a road event on it may bring (as `EnemyDef.danger`). */
  readonly danger: Danger;
  /** Ryo for passage (a ferry, a toll). */
  readonly cost?: number;
  /** What it takes to walk it; a road with needs must have a `name`. */
  readonly needs?: readonly RouteNeed[];
  /** The road as the player hears of it, starting a sentence: "The bay crossing". */
  readonly name?: string;
  /** Where it bends on the map between its ends (map units); straight when absent. */
  readonly trail?: readonly { readonly x: number; readonly y: number }[];
}

/** A leg as walked on a journey: which location it heads for. */
export interface JourneyLeg extends RouteLeg {
  readonly toward: string;
  /** The worst its road may bring (the route's `danger`), for what comes up on it. */
  readonly danger: Danger;
}

export interface Journey {
  /** Locations passed through on the way, not counting either end. */
  readonly via: readonly string[];
  /** The routes walked, in order. */
  readonly routeIds: readonly string[];
  /** Every leg in the order walked, with where it heads. */
  readonly legs: readonly JourneyLeg[];
  readonly days: number;
  readonly cost: number;
  readonly danger: Danger;
}

interface Step {
  readonly route: RouteDef;
  readonly toward: string;
}

export function routeDays(route: RouteDef): number {
  return route.legs.reduce((sum, leg) => sum + leg.days, 0);
}

/** The worse of two dangers. */
export function worseDanger(a: Danger, b: Danger): Danger {
  return DANGERS.indexOf(a) >= DANGERS.indexOf(b) ? a : b;
}

/** The routes leaving `locationId`, each with the location it leads to. */
function stepsFrom(routes: readonly RouteDef[], locationId: string): Step[] {
  return routes.flatMap((route): Step[] => {
    if (route.from === locationId) return [{ route, toward: route.to }];
    if (route.to === locationId) return [{ route, toward: route.from }];
    return [];
  });
}

/** The first of a route's needs that `met` says is unmet, or null when it is open to you. */
export function unmetNeed(route: RouteDef, met: (need: RouteNeed) => boolean): RouteNeed | null {
  return route.needs?.find((need) => !met(need)) ?? null;
}

/** Days first, ryo to break a tie. */
function cheaper(a: Journey, b: Journey): boolean {
  return a.days < b.days || (a.days === b.days && a.cost < b.cost);
}

function extend(journey: Journey, step: Step, from: string): Journey {
  const ahead = step.route.from === from ? step.route.legs : [...step.route.legs].reverse();
  const legs = ahead.map((leg) => ({ ...leg, toward: step.toward, danger: step.route.danger }));
  return {
    via: journey.days === 0 ? [] : [...journey.via, from],
    routeIds: [...journey.routeIds, step.route.id],
    legs: [...journey.legs, ...legs],
    days: journey.days + routeDays(step.route),
    cost: journey.cost + (step.route.cost ?? 0),
    danger: worseDanger(journey.danger, step.route.danger),
  };
}

const STAY: Journey = { via: [], routeIds: [], legs: [], days: 0, cost: 0, danger: 'petty' };

/**
 * The quickest way from `from` to `to` over the routes `open` allows, or null if no open way
 * goes there. Dijkstra over a handful of locations; nothing here needs to be clever.
 */
export function findJourney(
  routes: readonly RouteDef[],
  from: string,
  to: string,
  open: (route: RouteDef) => boolean = () => true,
): Journey | null {
  const best = new Map<string, Journey>([[from, STAY]]);
  const settled = new Set<string>();
  for (;;) {
    const next = [...best.entries()]
      .filter(([id]) => !settled.has(id))
      .reduce<[string, Journey] | null>(
        (a, b) => (a === null || cheaper(b[1], a[1]) ? b : a),
        null,
      );
    if (next === null) return null;
    const [here, journey] = next;
    if (here === to) return journey;
    settled.add(here);
    for (const step of stepsFrom(routes, here).filter((s) => open(s.route))) {
      const known = best.get(step.toward);
      const via = extend(journey, step, here);
      if (!known || cheaper(via, known)) best.set(step.toward, via);
    }
  }
}

/** Every location reachable from `from` over all routes, `from` included. */
export function reachableFrom(routes: readonly RouteDef[], from: string): Set<string> {
  const seen = new Set([from]);
  const queue = [from];
  for (let here = queue.shift(); here !== undefined; here = queue.shift()) {
    for (const { toward } of stepsFrom(routes, here)) {
      if (!seen.has(toward)) {
        seen.add(toward);
        queue.push(toward);
      }
    }
  }
  return seen;
}
