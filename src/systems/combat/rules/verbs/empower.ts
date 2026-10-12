import { clamp, round1 } from '@/core';
import { STAT_IDS, type StatId } from '@/systems/stats';

import type { CombatAttributes, CombatCost, CombatTechnique } from '../../contract';
import type { EffectUse } from './use';

/**
 * Empower: a self-buff for a few exchanges, with a price (the Gates are the reference). How much
 * it raises the boosted stats comes from its power and the user's art; how long it holds from
 * their reserves (max chakra, until reserves are a stat of their own); the body pays health
 * each exchange, eased by willpower, and some empowers leave a cost due after the fight. Engines
 * raise the stats themselves while it holds, so every rule that reads a stat sees it.
 */

/** Share of a boosted stat each point of power adds… */
const SHARE_PER_POWER = 0.015;
/** …and each point of the user's drive (their art) adds this much more of that. */
const SHARE_PER_DRIVE = 0.01;
const MAX_SHARE = 0.6;
/** An empower holds one exchange after the one it is used in, plus one per this much chakra. */
const CHAKRA_PER_EXCHANGE = 50;
export const MAX_EMPOWER_EXCHANGES = 4;
/** Each point of willpower takes this share off the health price, down to the floor. */
const WILL_EASE_PER_POINT = 0.015;
const MIN_PRICE_SHARE = 0.5;
/** The price never knocks the user out: health stops falling here. */
export const EMPOWER_HEALTH_FLOOR = 1;

type Stat = keyof CombatAttributes;

/** An empower in force on a fighter. */
export interface Empowerment {
  readonly techniqueId: string;
  /** What it added to each boosted stat, taken back when it ends. */
  readonly added: Readonly<Partial<Record<Stat, number>>>;
  /** The last exchange it holds. */
  readonly until: number;
  /** Health paid at the end of each exchange it holds. */
  readonly healthPerExchange: number;
}

/** What a fighter carries of empowerment. Absent in fights saved before it existed. */
export interface EmpowerMemory {
  readonly empowered?: Empowerment;
  /** Techniques used whose empower leaves a cost after the fight, once per use. */
  readonly empowersUsed?: readonly string[];
}

interface Empowerable extends EmpowerMemory {
  readonly attributes: CombatAttributes;
  readonly maxChakra: number;
  readonly health: number;
}

/** The share of each boosted stat an empower adds, from its power and the user's drive. */
export function empowerShare(drive: number, use: EffectUse<'empower'>): number {
  return clamp(use.effect.power * SHARE_PER_POWER * (1 + drive * SHARE_PER_DRIVE), 0, MAX_SHARE);
}

/**
 * Exchanges an empower holds after the one it is used in (that turn went on using it): deeper
 * reserves hold it longer.
 */
export function empowerExchanges(maxChakra: number): number {
  return clamp(1 + Math.floor(maxChakra / CHAKRA_PER_EXCHANGE), 1, MAX_EMPOWER_EXCHANGES);
}

/** Health the body pays each exchange, eased by willpower. */
export function empowerPrice(willpower: number, use: EffectUse<'empower'>): number {
  const base = use.effect.healthPerExchange ?? 0;
  const share = Math.max(MIN_PRICE_SHARE, 1 - willpower * WILL_EASE_PER_POINT);
  return base > 0 ? Math.max(1, Math.round(base * share)) : 0;
}

function addTo(attributes: CombatAttributes, added: Empowerment['added'], sign: 1 | -1) {
  const next: Record<StatId, number> = { ...attributes };
  for (const id of STAT_IDS) {
    const amount = added[id];
    if (amount !== undefined) next[id] = round1(next[id] + sign * amount);
  }
  return next;
}

/** What an empower changes on its user: raised stats, the empowerment, a cost to remember. */
export interface Empowered {
  readonly attributes: CombatAttributes;
  readonly empowered: Empowerment;
  readonly empowersUsed?: readonly string[];
}

/** Raises a fighter's stats, starting in exchange `exchange`. */
export function empower(
  fighter: Empowerable,
  use: EffectUse<'empower'>,
  { drive, exchange }: { readonly drive: number; readonly exchange: number },
): Empowered {
  const share = empowerShare(drive, use);
  const boosts: readonly StatId[] = use.effect.boosts;
  const added = Object.fromEntries(
    boosts.map((stat) => [stat, round1(fighter.attributes[stat] * share)]),
  );
  const empowered: Empowerment = {
    techniqueId: use.technique.id,
    added,
    until: exchange + empowerExchanges(fighter.maxChakra),
    healthPerExchange: empowerPrice(fighter.attributes.willpower, use),
  };
  const attributes = addTo(fighter.attributes, added, 1);
  if (!use.effect.afterCost) return { attributes, empowered };
  return {
    attributes,
    empowered,
    empowersUsed: [...(fighter.empowersUsed ?? []), use.technique.id],
  };
}

/** Health after paying for an empower in force for one exchange: never below the floor. */
export function healthAfterPrice(fighter: Empowerable): number {
  const price = fighter.empowered?.healthPerExchange ?? 0;
  if (fighter.health <= EMPOWER_HEALTH_FLOOR) return fighter.health;
  return Math.max(EMPOWER_HEALTH_FLOOR, fighter.health - price);
}

/** Whether an empower in force ends with this exchange. */
export function empowerEnds(fighter: Empowerable, exchange: number): boolean {
  return fighter.empowered !== undefined && fighter.empowered.until <= exchange;
}

/** The stats once an empower in force is over: what it added, taken back. */
export function attributesAfterEmpower(fighter: Empowerable): CombatAttributes {
  return fighter.empowered
    ? addTo(fighter.attributes, fighter.empowered.added, -1)
    : fighter.attributes;
}

/** The after-fight costs a fighter owes for the empowers they used, one per use. */
export function empowerCostsOwed(
  fighter: EmpowerMemory & { readonly techniques: readonly CombatTechnique[] },
): CombatCost[] {
  return (fighter.empowersUsed ?? []).flatMap((id) => {
    const technique = fighter.techniques.find((t) => t.id === id);
    const effect = technique?.effects.find((e) => e.verb === 'empower');
    if (!technique || effect?.verb !== 'empower' || !effect.afterCost) return [];
    return [{ techniqueId: id, techniqueName: technique.name, cost: effect.afterCost }];
  });
}
