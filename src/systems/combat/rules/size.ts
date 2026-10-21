import { clamp } from '@/core';

import type { BodySize } from '../contract';

/**
 * Size, in every fight style that reads it. Most people are human-sized; a clan may breed
 * bodies far bigger (`CombatantSetup.size`), and a technique may make its user bigger still
 * while it holds (an empower's `grows`). A bigger body:
 *  - has more of itself to lose (more health) and takes a blow better (toughness);
 *  - is a bigger target: it slips attacks less often;
 *  - hits a smaller one harder than any blow between equals may (the cap on a single hit
 *    rises with each step of difference);
 *  - walks through what would stop a smaller one closing in, and leans its weight into a step;
 *  - at its biggest, reaches past arm's length with a fist.
 * A small body is the other way about.
 */

export const BODY_SIZES = [
  'small',
  'human',
  'large',
  'huge',
] as const satisfies readonly BodySize[];

interface SizeRule {
  /** Health against a human's. */
  readonly health: number;
  /** Toughness against a human's. */
  readonly toughness: number;
  /** How often it slips an attack, against a human. */
  readonly slips: number;
}

const SIZE_RULES: Readonly<Record<BodySize, SizeRule>> = {
  small: { health: 0.85, toughness: 0.9, slips: 1.1 },
  human: { health: 1, toughness: 1, slips: 1 },
  large: { health: 1.3, toughness: 1.2, slips: 0.85 },
  huge: { health: 1.7, toughness: 1.45, slips: 0.65 },
};

/** A body this big or bigger walks through a hold-off… */
const WALKS_THROUGH_FROM: BodySize = 'large';
/** …unless the shot took more than this share of its health. */
export const WALK_THROUGH_SHARE = 0.2;
/** A step in is this much likelier for each size step bigger than the foe. */
export const STEP_PER_SIZE = 0.08;

/** What size a body is now: its own, grown by a technique holding. */
interface Sized {
  readonly size?: BodySize;
  readonly empowered?: { readonly grows?: number };
}

function stepOf(size: BodySize): number {
  return BODY_SIZES.indexOf(size);
}

/** A fighter's size as it stands: bred size, grown by any empower holding. */
export function sizeOf(f: Sized): BodySize {
  const grown = stepOf(f.size ?? 'human') + (f.empowered?.grows ?? 0);
  return BODY_SIZES[clamp(grown, 0, BODY_SIZES.length - 1)] ?? 'human';
}

/** How many size steps bigger the first is than the second (negative when smaller). */
export function sizeGap(a: Sized, b: Sized): number {
  return stepOf(sizeOf(a)) - stepOf(sizeOf(b));
}

/** A body's health against a human's, by its bred size (a technique's growth doesn't add any). */
export function sizeHealthScale(size: BodySize | undefined): number {
  return SIZE_RULES[size ?? 'human'].health;
}

export function sizeToughness(f: Sized): number {
  return SIZE_RULES[sizeOf(f)].toughness;
}

export function sizeSlips(f: Sized): number {
  return SIZE_RULES[sizeOf(f)].slips;
}

/** Whether a body this size keeps coming through a shot that took `taken` of `maxHealth`. */
export function walksThrough(f: Sized, taken: number, maxHealth: number): boolean {
  return stepOf(sizeOf(f)) >= stepOf(WALKS_THROUGH_FROM) && taken <= maxHealth * WALK_THROUGH_SHARE;
}

/** Whether a body is big enough for its fists to reach past arm's length. */
export function reachesWithFists(f: Sized): boolean {
  return sizeOf(f) === 'huge';
}
