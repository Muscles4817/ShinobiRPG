import type { Element } from '@/systems/techniques';

import type { CombatGround } from './groundContract';

/**
 * The dust part of the combat contract (see `contract.ts`, `docs/design/retinue-plan.md` step
 * 4e): a pool of matter its user commands (sand, iron sand, gold dust, ash, glass), carried in
 * and drawn up mid-fight where the ground holds it. Dust techniques spend it, a draw pulls more
 * up, and the elements it can't bear scatter it. The game reads back how much is left
 * (`CombatOutcome.dust`).
 */

/**
 * What every dust has, as a matter of degree (graded 1 to 5, E to A): weight (hits and walls
 * harder, but slower to arrive), hold (grabs and coffins grip harder) and draw (how much a draw
 * pulls up).
 */
export const DUST_QUALITIES = ['weight', 'hold', 'draw'] as const;
export type DustQuality = (typeof DUST_QUALITIES)[number];

/**
 * What only some dust does, weak to great (1 to 3): cutting (its hits leave a bleed) and
 * blinding (a foe it reaches aims worse for a while).
 */
export const DUST_GIFTS = ['cutting', 'blinding'] as const;
export type DustGift = (typeof DUST_GIFTS)[number];

/**
 * What scatters it: an element it can't bear (water soaks sand, lightning scatters iron, wind
 * blows ash away), or `heavy`, a hard blow that shatters it (glass).
 */
export type DustBane = Element | 'heavy';

/** A kind of dust's rules, as data. */
export interface DustKind {
  readonly name: string;
  readonly qualities: Readonly<Record<DustQuality, number>>;
  readonly gifts: Readonly<Partial<Record<DustGift, number>>>;
  readonly banes: readonly DustBane[];
  /** Grounds that hold it, where a draw pulls it up in full; elsewhere only what fell near. */
  readonly drawnOn: readonly CombatGround[];
}

/** A user's dust as it goes into a fight. */
export interface CombatDust {
  readonly kind: DustKind;
  /** How much they command now. */
  readonly count: number;
  /** As much as they can hold up at once. */
  readonly cap: number;
}
