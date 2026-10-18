import { clamp } from '@/core';

import type {
  CombatantSetup,
  CombatantView,
  CombatGrammar,
  CombatItem,
  CombatPerk,
  CombatProvision,
  CombatSide,
  CombatTechnique,
  CombatTrait,
} from '../contract';
import type { CombatGear } from '../gearContract';
import { armouredAttributes } from './armour';
import { areaCostScale } from './chakra';
import { startsHidden } from './conditions';
import { unstableCostScale } from './unstable';
import type { EffectUse } from './verbs';

/**
 * The fighter shape and formulas the newer engines share. Each engine extends `Body` with its
 * own fields (block, momentum, plans) but hits and resists the same way (`damage.ts`,
 * `defence.ts`), so comparing fight styles compares the styles, not different maths.
 */

export interface Body {
  readonly id: string;
  readonly name: string;
  /** What the story calls them (`CombatantSetup.called`). */
  readonly called?: string;
  readonly grammar?: CombatGrammar;
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
  /** Tools still in the pouch (only the player carries any). */
  readonly items: readonly CombatItem[];
  /** Equipped gear; absent for fighters armed as their kit suggests (`gearContract.ts`). */
  readonly gear?: CombatGear;
  /** What a meal brought into the fight (`provisions.ts`); absent for most. */
  readonly provisions?: readonly CombatProvision[];
}

export function bodyFrom(setup: CombatantSetup, side: CombatSide, isPlayer = false): Body {
  const traits = setup.traits ?? [];
  return {
    ...setup,
    // Armour slows its wearer for the whole fight (`armour.ts`).
    attributes: armouredAttributes(setup.attributes, setup.gear),
    side,
    isPlayer,
    perks: setup.perks ?? [],
    traits,
    hidden: startsHidden({ traits }),
    confused: 0,
    items: setup.items ?? [],
  };
}

type KitField = 'traits' | 'hidden' | 'confused' | 'items';

/** Bodies from saves made before traits and tools existed lack those fields; fill them in. */
export function withKit<B extends Omit<Body, KitField>>(
  b: B & Partial<Pick<Body, KitField>>,
): B & Pick<Body, KitField> {
  return {
    ...b,
    traits: b.traits ?? [],
    hidden: b.hidden ?? false,
    confused: b.confused ?? 0,
    items: b.items ?? [],
  };
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

/** Turns a daze or seal lasts: stronger effects hold longer. */
export function holdTurns(effect: Pick<EffectUse['effect'], 'power'>): number {
  return effect.power >= 12 ? 2 : 1;
}

/**
 * Chakra a technique costs, after the user's chakra control (up to a third off), more for an
 * unstable one, and more for one that covers more ground (`chakra.ts`).
 */
export function chakraCost(
  user: Pick<Body, 'attributes'>,
  technique: Pick<CombatTechnique, 'chakraCost' | 'unstable'> & {
    readonly effects?: CombatTechnique['effects'];
  },
): number {
  const discount = clamp(user.attributes.chakraControl / 60, 0, 1 / 3);
  const base = technique.chakraCost * unstableCostScale(technique) * areaCostScale(technique);
  return Math.max(1, Math.round(base * (1 - discount)));
}
