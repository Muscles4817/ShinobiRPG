import { DANGERS, type Danger } from '@/systems/missions';

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
}

export interface Journey {
  /** Locations passed through on the way, not counting either end. */
  readonly via: readonly string[];
  /** Every leg in the order walked. */
  readonly legs: readonly RouteLeg[];
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

/** Days first, ryo to break a tie. */
function cheaper(a: Journey, b: Journey): boolean {
  return a.days < b.days || (a.days === b.days && a.cost < b.cost);
}

function extend(journey: Journey, step: Step, from: string): Journey {
  const legs = step.route.from === from ? step.route.legs : [...step.route.legs].reverse();
  return {
    via: journey.days === 0 ? [] : [...journey.via, from],
    legs: [...journey.legs, ...legs],
    days: journey.days + routeDays(step.route),
    cost: journey.cost + (step.route.cost ?? 0),
    danger: worseDanger(journey.danger, step.route.danger),
  };
}

const STAY: Journey = { via: [], legs: [], days: 0, cost: 0, danger: 'petty' };

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
