import { clamp, logistic } from '@/core';

import type {
  CombatantSetup,
  CombatantView,
  CombatPerk,
  CombatSide,
  CombatTechnique,
  CombatTrait,
} from '../contract';
import { startsHidden } from './conditions';
import { elementMultiplier } from './elements';

/**
 * The fighter shape and formulas the newer engines share. Each engine extends `Body` with its
 * own fields (block, momentum, plans) but hits and resists the same way, so comparing fight
 * styles compares the styles, not different maths.
 */

export interface Body {
  readonly id: string;
  readonly name: string;
  readonly tag?: string;
  readonly side: CombatSide;
  readonly isPlayer: boolean;
  readonly attributes: CombatantSetup['attributes'];
  readonly health: number;
  readonly maxHealth: number;
  readonly chakra: number;
  readonly maxChakra: number;
  readonly techniques: readonly CombatTechnique[];
  readonly nature?: CombatantSetup['nature'];
  readonly perks: readonly CombatPerk[];
  readonly traits: readonly CombatTrait[];
  /** Hidden in an illusion: can't be targeted until found. */
  readonly hidden: boolean;
  /** Turns of confusion left: actions may misfire. */
  readonly confused: number;
}

export function bodyFrom(setup: CombatantSetup, side: CombatSide, isPlayer = false): Body {
  const traits = setup.traits ?? [];
  return {
    ...setup,
    side,
    isPlayer,
    perks: setup.perks ?? [],
    traits,
    hidden: startsHidden({ traits }),
    confused: 0,
  };
}

/** Bodies from saves made before traits existed lack the new fields; fill them in. */
export function withKit<B extends Omit<Body, 'traits' | 'hidden' | 'confused'>>(
  b: B & Partial<Pick<Body, 'traits' | 'hidden' | 'confused'>>,
): B & Pick<Body, 'traits' | 'hidden' | 'confused'> {
  return { ...b, traits: b.traits ?? [], hidden: b.hidden ?? false, confused: b.confused ?? 0 };
}

/** Can be picked as a target: alive and not hidden. */
export function targetable(b: Pick<Body, 'health' | 'hidden'>): boolean {
  return b.health > 0 && !b.hidden;
}

/** Statuses every engine shows for the shared conditions. */
export function conditionStatuses(b: Pick<Body, 'hidden' | 'confused'>): string[] {
  return [...(b.hidden ? ['Hidden'] : []), ...(b.confused > 0 ? ['Confused'] : [])];
}

export function alive(b: Pick<Body, 'health'>): boolean {
  return b.health > 0;
}

export function hasPerk(b: Pick<Body, 'perks'>, perk: CombatPerk): boolean {
  return b.perks.includes(perk);
}

export function viewOf(b: Body, statuses: readonly string[], intent?: string): CombatantView {
  return {
    id: b.id,
    name: b.name,
    ...(b.tag === undefined ? {} : { tag: b.tag }),
    side: b.side,
    health: b.health,
    maxHealth: b.maxHealth,
    chakra: b.chakra,
    maxChakra: b.maxChakra,
    statuses: alive(b) ? [...conditionStatuses(b), ...statuses] : ['Down'],
    ...(intent === undefined ? {} : { intent }),
    targetable: targetable(b),
  };
}

/** ±20% so fights aren't fully predictable. */
export function variance(roll: number): number {
  return 0.8 + roll * 0.4;
}

function armour(defender: Body): number {
  return defender.attributes.stamina * 0.3;
}

/** A plain blow: strength and taijutsu. */
export function strikeDamage(attacker: Body, defender: Body, roll: number): number {
  const { strength, taijutsu } = attacker.attributes;
  const raw = (4 + strength * 0.5 + taijutsu * 0.5) * variance(roll);
  return Math.max(1, Math.round(raw - armour(defender)));
}

const PHYSICAL_BONUS: Readonly<Record<CombatTechnique['discipline'], (b: Body) => number>> = {
  taijutsu: (b) => b.attributes.strength * 0.3,
  kenjutsu: (b) => b.attributes.strength * 0.15 + b.attributes.speed * 0.15,
  ninjutsu: () => 0,
  genjutsu: () => 0,
  fuuinjutsu: () => 0,
};

/** A damaging technique: power scaled by skill, body stats for physical arts, and elements. */
export function techniqueDamage(
  attacker: Body,
  defender: Body,
  technique: CombatTechnique,
  roll: number,
): number {
  const skill = attacker.attributes[technique.discipline];
  const elements = elementMultiplier(technique, attacker.nature, defender.nature);
  const raw =
    (technique.power * (1 + skill / 20) + PHYSICAL_BONUS[technique.discipline](attacker)) *
    elements *
    variance(roll);
  return Math.max(1, Math.round(raw - armour(defender)));
}

export function healAmount(user: Body, technique: CombatTechnique): number {
  return Math.round(technique.power * (1 + user.attributes.ninjutsu / 25));
}

/** Genjutsu is resisted by willpower; everything else by perception. */
export function resistChance(attacker: Body, defender: Body, technique: CombatTechnique): number {
  const skill = attacker.attributes[technique.discipline];
  const defence =
    technique.discipline === 'genjutsu'
      ? defender.attributes.willpower
      : defender.attributes.perception;
  return clamp(0.6 * logistic((defence - skill) / 4), 0.05, 0.6);
}

/** Turns a daze or seal lasts: stronger techniques hold longer. */
export function holdTurns(technique: CombatTechnique): number {
  return technique.power >= 12 ? 2 : 1;
}

/** Chakra a technique costs, after the user's chakra control (up to a third off). */
export function chakraCost(user: Body, technique: CombatTechnique): number {
  const discount = clamp(user.attributes.chakraControl / 60, 0, 1 / 3);
  return Math.max(1, Math.round(technique.chakraCost * (1 - discount)));
}
