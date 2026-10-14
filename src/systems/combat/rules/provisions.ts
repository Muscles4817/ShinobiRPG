import type { CombatProvision } from '../contract';
import type { Affliction } from './verbs/lingering';

/**
 * Provisions: what a good meal brings into a fight, once for every engine. Fortified tops up
 * chakra as the fight opens, steady keeps a daze from taking hold in the opening exchanges,
 * antidote makes burns, bleeds and poison wear off sooner, and a second wind gives back a
 * little health, once, when the fighter is badly hurt. None of them is a stat.
 */

/** Share of maximum chakra a fortifying meal tops up as the fight opens. */
export const FORTIFIED_SHARE = 0.25;
/** A steady fighter shrugs off dazes through this exchange. */
export const STEADY_THROUGH_EXCHANGE = 2;
/** Exchanges an antidote takes off a fresh harm (it always lasts at least one). */
export const ANTIDOTE_EXCHANGES = 1;
/** Below this share of health, a second wind comes… */
export const SECOND_WIND_BELOW = 0.25;
/** …giving back this much health, once a fight. */
export const SECOND_WIND_HEAL = 15;

interface Provisioned {
  readonly provisions?: readonly CombatProvision[];
}

export function hasProvision(f: Provisioned, provision: CombatProvision): boolean {
  return f.provisions?.includes(provision) ?? false;
}

/** Chakra as the fight opens: topped up by a fortifying meal, never past the maximum. */
export function openingChakra(
  f: Provisioned & { readonly chakra: number; readonly maxChakra: number },
): number {
  if (!hasProvision(f, 'fortified')) return f.chakra;
  return Math.min(f.maxChakra, f.chakra + Math.round(f.maxChakra * FORTIFIED_SHARE));
}

/** The exchange a fighter stays steady through from the start, if a meal steadied them. */
export function openingSteadiness(f: Provisioned): number | undefined {
  return hasProvision(f, 'steady') ? STEADY_THROUGH_EXCHANGE : undefined;
}

/** A fresh harm on a fighter with an antidote in them: it wears off sooner. */
export function withAntidote(f: Provisioned, harm: Affliction): Affliction {
  if (!hasProvision(f, 'antidote')) return harm;
  return { ...harm, exchanges: Math.max(1, harm.exchanges - ANTIDOTE_EXCHANGES) };
}

/** Whether a second wind comes now: badly hurt, still standing, and not yet spent. */
export function secondWindDue(
  f: Provisioned & { readonly health: number; readonly maxHealth: number },
  spent: boolean,
): boolean {
  return (
    !spent &&
    hasProvision(f, 'second-wind') &&
    f.health > 0 &&
    f.health < f.maxHealth * SECOND_WIND_BELOW
  );
}
