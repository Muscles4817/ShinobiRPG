import type { CombatMind } from '../mindContract';
import type { Body } from './body';

/**
 * Bodies of one mind (`mindContract.ts`, `docs/design/retinue-plan.md` step 6), the rules every
 * engine reads: who shares a mind, how hard a source is to find off the field, and what raising
 * a fallen body takes and gives.
 */

/** How much harder than their own illusions a source is to find, standing off the field. */
export const SOURCE_DISTANCE = 8;
/** The share of its health a body comes back up with. */
export const RAISED_SHARE = 0.5;
/** The share of the raiser's full chakra a raising costs. */
export const RAISE_COST_SHARE = 0.2;

type Minded = Pick<Body, 'id' | 'side'> & { readonly mind?: CombatMind };

/** The mind a fighter thinks with: a shared one's id, else their own. */
export function mindOf(f: Minded): string {
  return f.mind?.id ?? f.id;
}

/**
 * Whether two fighters are of one mind: the same side and the same mind, shared by at least one
 * of them (a caller's own mind is their id, which the bodies they call share).
 */
export function sameMind(a: Minded, b: Minded): boolean {
  const shared = a.mind !== undefined || b.mind !== undefined;
  return shared && a.id !== b.id && a.side === b.side && mindOf(a) === mindOf(b);
}

/** Whether this fighter is a mind's source, off the field. */
export function isSource(f: { readonly mind?: CombatMind }): boolean {
  return f.mind?.source === true;
}

/** How hard a source is to find: its own illusions or wits, and the distance it keeps. */
export function sourceConcealment(f: Pick<Body, 'attributes'>): number {
  return Math.max(f.attributes.genjutsu, f.attributes.intellect) + SOURCE_DISTANCE;
}

/** What raising a body costs its raiser, in chakra. */
export function raiseCost(raiser: Pick<Body, 'maxChakra'>): number {
  return Math.round(raiser.maxChakra * RAISE_COST_SHARE);
}

/** The health a raised body comes back with. */
export function raisedHealth(body: Pick<Body, 'maxHealth'>): number {
  return Math.max(1, Math.round(body.maxHealth * RAISED_SHARE));
}
