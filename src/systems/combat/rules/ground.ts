import type { Element } from '@/systems/techniques';

import type { CombatGround, CombatPerk, RangeBand } from '../contract';

/**
 * Where a fight happens changes it. Each ground says which distances it has room for, how much
 * cover it gives someone hiding, how often an attack from far off goes wide among trees or
 * walls, which elements it feeds, and what footing it gives: on a lake, only someone who walks
 * on water keeps theirs; among trees or roofs, someone who walks up them fights from range
 * unhindered. In a room an area technique catches its user's own side too. In the desert the
 * heat haze throws off long shots, and the dry air feeds wind and fire and starves water. An
 * arena is open ground, as every fight was before grounds.
 */

export interface GroundRule {
  readonly name: string;
  /** What the opening line says of it. */
  readonly line: string;
  /** The distances there is room for, near to far. */
  readonly bands: readonly RangeBand[];
  /** Added to how well anyone hiding here is hidden. */
  readonly cover: number;
  /** Chance an attack from far range goes wide, for anyone without the walker's perk. */
  readonly farMiss: number;
  /** Chance an attack from far range goes wide whoever makes it: a heat haze. */
  readonly haze?: number;
  /** The perk that keeps its footing here and lifts its penalties. */
  readonly walker?: CombatPerk;
  /** Share of their step and dodge chances kept by anyone without the walker's perk. */
  readonly footing: number;
  /** How much stronger an element's techniques are here. */
  readonly elements: Partial<Readonly<Record<Element, number>>>;
  /** An area technique also catches its user's own side. */
  readonly closeQuarters?: true;
}

const ALL_BANDS: readonly RangeBand[] = ['close', 'mid', 'far'];

export const GROUND_RULES: Readonly<Record<CombatGround, GroundRule>> = {
  arena: {
    name: 'Arena',
    line: 'Open ground, nowhere to hide.',
    bands: ALL_BANDS,
    cover: 0,
    farMiss: 0,
    footing: 1,
    elements: {},
  },
  forest: {
    name: 'Forest',
    line: 'Among the trees: easy to hide, hard to aim from far off, and fire catches.',
    bands: ALL_BANDS,
    cover: 4,
    farMiss: 0.2,
    walker: 'tree-walking',
    footing: 1,
    elements: { fire: 1.15 },
  },
  town: {
    name: 'Town',
    line: 'Streets and rooftops: corners to hide behind and walls in the way.',
    bands: ALL_BANDS,
    cover: 3,
    farMiss: 0.1,
    walker: 'tree-walking',
    footing: 1,
    elements: {},
  },
  room: {
    name: 'Room',
    line: 'Four walls: no room to back away, and a wide technique hits everyone.',
    bands: ['close', 'mid'],
    cover: 0,
    farMiss: 0,
    footing: 1,
    elements: {},
    closeQuarters: true,
  },
  lake: {
    name: 'Lake',
    line: 'Open water: whoever can stand on it moves freely, and water and lightning run strong.',
    bands: ALL_BANDS,
    cover: 0,
    farMiss: 0,
    walker: 'water-walking',
    footing: 0.5,
    elements: { water: 1.25, lightning: 1.15 },
  },
  desert: {
    name: 'Desert',
    line: 'Open sand under the sun. Nowhere to hide, a heat haze over anything far off, and air so dry that wind and fire run strong while water has nothing to draw on.',
    bands: ALL_BANDS,
    cover: 0,
    farMiss: 0,
    haze: 0.12,
    footing: 1,
    elements: { wind: 1.15, fire: 1.1, water: 0.85 },
  },
};

interface Footed {
  readonly perks: readonly CombatPerk[];
}

export function groundRule(ground: CombatGround | undefined): GroundRule {
  return GROUND_RULES[ground ?? 'arena'];
}

/** Whether a fighter has the walker's perk for this ground (or the ground needs none). */
export function sureFooted(ground: CombatGround | undefined, f: Footed): boolean {
  const walker = groundRule(ground).walker;
  return walker === undefined || f.perks.includes(walker);
}

/** Share of their step and dodge chances a fighter keeps on this ground. */
export function footingOf(ground: CombatGround | undefined, f: Footed): number {
  return sureFooted(ground, f) ? 1 : groundRule(ground).footing;
}

/** Chance a fighter's attack from this distance goes wide on this ground. */
export function groundMiss(ground: CombatGround | undefined, f: Footed, band: RangeBand): number {
  if (band !== 'far') return 0;
  const rule = groundRule(ground);
  return (sureFooted(ground, f) ? 0 : rule.farMiss) + (rule.haze ?? 0);
}

/** How much stronger a technique of this element is here. */
export function groundElementScale(ground: CombatGround | undefined, element?: Element): number {
  return element ? (groundRule(ground).elements[element] ?? 1) : 1;
}

/** The nearest distance the ground has room for at or inside this one (a room has no far). */
export function withinGround(ground: CombatGround | undefined, band: RangeBand): RangeBand {
  const bands = groundRule(ground).bands;
  if (bands.includes(band)) return band;
  return bands[bands.length - 1] ?? band;
}
