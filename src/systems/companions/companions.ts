import { addPoints, bondWith, stageOf } from '@/systems/bonds';
import type { Aptitude, Stats } from '@/systems/stats';

/**
 * Companions: bonded creatures that fight beside someone (`docs/design/retinue-plan.md`). A
 * companion's record is its own (stats, talent, the bond), kept by owner so anyone may have
 * one; the player's is under `PLAYER_OWNER`. How a kind takes to people is its temperament,
 * read from one table: how fast the bond grows and how many stages later it takes orders.
 * Befriending a stray is a few days' visits; once it trusts you, it comes home.
 */

export const COMPANION_TEMPERAMENTS = ['bred', 'stray', 'wild'] as const;
export type CompanionTemperament = (typeof COMPANION_TEMPERAMENTS)[number];

/** The owner id the player's companion is kept under. */
export const PLAYER_OWNER = 'player';

export interface Companion {
  /** Stable for its life, so its combatant id and growth hash never change. */
  readonly id: string;
  readonly kindId: string;
  readonly name: string;
  readonly stats: Stats;
  /** Its hidden talent, rolled when it joined you. */
  readonly aptitude: Aptitude;
  /** Bond points with its owner (`systems/bonds` stages). */
  readonly bond: number;
  /** The last day its routine has been caught up through. */
  readonly lastGrownDay: number;
  /** Its health now, out of its kind's maximum; it carries between fights and mends overnight. */
  readonly health: number;
  /** The last day it was given a meal (`care.ts`). */
  readonly lastFedDay: number;
  /** The last day you played with it. */
  readonly lastPlayDay: number | null;
  /** Knocked down in a fight: home until this day dawns, and not treated by a vet yet. */
  readonly injury: CompanionInjury | null;
  /** Whether you have found out its favourite food. */
  readonly favouriteKnown: boolean;
}

/** A companion laid up after a fight. */
export interface CompanionInjury {
  readonly until: number;
  /** A vet has seen to it (once per injury). */
  readonly treated: boolean;
  /** The last day it was given medicine (once a day). */
  readonly dosedDay: number | null;
}

/** A stray you are winning over: how many days you've spent with it, and the last. */
export interface StrayFriendship {
  readonly kindId: string;
  readonly visits: number;
  readonly lastVisitDay: number;
}

export interface Companions {
  /** Each owner's companion (one each, for now), by owner id. */
  readonly owned: Readonly<Record<string, Companion>>;
  readonly befriending: StrayFriendship | null;
  /** A stray of yours that went back to the streets, kept to come home again if won back. */
  readonly strayed: Companion | null;
  /** Doses of medicine you carry for it. */
  readonly medicine: number;
}

export const NO_COMPANIONS: Companions = {
  owned: {},
  befriending: null,
  strayed: null,
  medicine: 0,
};

interface TemperamentRules {
  /** Bond gained, as a multiple of what a person would give. */
  readonly bondRate: number;
  /** How many bond stages later than a bred animal it takes orders. */
  readonly ordersLater: number;
}

const TEMPERAMENT_RULES: Readonly<Record<CompanionTemperament, TemperamentRules>> = {
  bred: { bondRate: 1.2, ordersLater: 0 },
  stray: { bondRate: 1, ordersLater: 0 },
  wild: { bondRate: 0.6, ordersLater: 1 },
};

/** The bond stage a bred companion takes stance orders at, and card orders. */
const STANCE_ORDERS_STAGE = 1;
const CARD_ORDERS_STAGE = 2;

/** Days spent with a stray before it follows you home, and the bond it starts with. */
export const STRAY_VISITS_NEEDED = 3;
export const STRAY_START_BOND = 5;

/** Bond points for some time together, by temperament. */
export function bondGain(base: number, temperament: CompanionTemperament): number {
  return base * TEMPERAMENT_RULES[temperament].bondRate;
}

/** A companion with more bond (never past the top or below none). */
export function withBond(companion: Companion, delta: number): Companion {
  return { ...companion, bond: addPoints(bondWith(companion.bond), delta).points };
}

/** The bond stages at which a companion of this temperament takes stance and card orders. */
export function ordersStages(temperament: CompanionTemperament): {
  readonly stance: number;
  readonly cards: number;
} {
  const later = TEMPERAMENT_RULES[temperament].ordersLater;
  return { stance: STANCE_ORDERS_STAGE + later, cards: CARD_ORDERS_STAGE + later };
}

/** Which orders a companion takes from its owner at this bond. */
export function ordersOpen(
  bond: number,
  temperament: CompanionTemperament,
): { readonly stance: boolean; readonly cards: boolean } {
  const stage = stageOf(bond);
  const at = ordersStages(temperament);
  return { stance: stage >= at.stance, cards: stage >= at.cards };
}

/** The befriending after one more day with a stray. */
export function visitStray(
  befriending: StrayFriendship | null,
  kindId: string,
  day: number,
): StrayFriendship {
  const visits = befriending?.kindId === kindId ? befriending.visits + 1 : 1;
  return { kindId, visits, lastVisitDay: day };
}

/** Whether a stray now trusts you enough to come home. */
export function strayWon(befriending: StrayFriendship): boolean {
  return befriending.visits >= STRAY_VISITS_NEEDED;
}
