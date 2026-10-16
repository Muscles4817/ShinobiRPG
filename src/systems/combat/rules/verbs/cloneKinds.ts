import type { CloneKind, Element } from '@/systems/techniques';

import type { EffectUse } from './use';

/**
 * What each kind of clone is worth (`docs/design/hittability-plan.md`, Part 4), once, so the
 * techniques that make them differ: what it costs to keep up, how hard it hits beside its maker,
 * how well it holds up, and its own trick.
 *  - Illusion: cheap and harmless; decoys only, and a shot passes through it.
 *  - Water and wind: cheap and fragile; wind is quick, and screens a charge best.
 *  - Earth: dear and tough; it may shrug off a hit, and one rebuilds between exchanges.
 *  - Lightning: dear; whoever bursts one with a blow up close takes a shock.
 *  - Fire: it feeds itself, so it costs nothing to keep up.
 *  - Shadow: the dearest, a share of the maker in each; they strike hardest, as one.
 * A kind is named by the technique, or follows it: illusions unless solid, a solid clone takes
 * its technique's element, and solid clones of no element are shadow clones.
 */

export interface CloneRule {
  /** Each clone's blow beside its maker, against the maker's own. */
  readonly blow: number;
  /** Chakra each clone takes to keep up, each exchange. */
  readonly upkeep: number;
  /** Chance a hit that strikes one leaves it standing. */
  readonly sturdy: number;
  /** One that burst rebuilds between exchanges, up to as many as were made. */
  readonly rebuilds: boolean;
  /** A blow that bursts one up close shocks the striker with this share of the maker's blow. */
  readonly shock: number;
  /** How readily they draw a holder's fire ahead of a charge, against a plain solid clone. */
  readonly screen: number;
}

const FRAIL = { sturdy: 0, rebuilds: false, shock: 0 } as const;

export const CLONE_RULES: Readonly<Record<CloneKind, CloneRule>> = {
  illusion: { ...FRAIL, blow: 0, upkeep: 0, screen: 0.5 },
  water: { ...FRAIL, blow: 0.2, upkeep: 0.5, screen: 1 },
  wind: { ...FRAIL, blow: 0.2, upkeep: 0.5, screen: 1.4 },
  earth: { ...FRAIL, blow: 0.25, upkeep: 1, sturdy: 0.5, rebuilds: true, screen: 1 },
  lightning: { ...FRAIL, blow: 0.25, upkeep: 1, shock: 0.5, screen: 1 },
  fire: { ...FRAIL, blow: 0.25, upkeep: 0, screen: 1 },
  shadow: { ...FRAIL, blow: 0.35, upkeep: 1.5, screen: 1 },
};

const BY_ELEMENT: Readonly<Record<Element, CloneKind>> = {
  water: 'water',
  wind: 'wind',
  earth: 'earth',
  lightning: 'lightning',
  fire: 'fire',
};

/** The kind of clone a technique makes. */
export function cloneKindFor({ technique, effect }: EffectUse<'clone'>): CloneKind {
  if (effect.kind) return effect.kind;
  if (!effect.strikes) return 'illusion';
  return technique.element ? BY_ELEMENT[technique.element] : 'shadow';
}

/** The kind of clones standing (clones made before kinds were solid shadows or illusions). */
export function kindOf(clones: {
  readonly kind?: CloneKind;
  readonly strikes: boolean;
}): CloneKind {
  return clones.kind ?? (clones.strikes ? 'shadow' : 'illusion');
}

/** Chakra a set of clones takes to keep up this exchange. */
export function cloneUpkeep(clones: {
  readonly kind?: CloneKind;
  readonly strikes: boolean;
  readonly count: number;
}): number {
  return Math.round(clones.count * CLONE_RULES[kindOf(clones)].upkeep);
}
