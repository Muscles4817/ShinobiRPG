import type { ModifierSpec } from '@/systems/modifiers';

import type { Character } from './state';

/**
 * Hot water: a soak takes a stretch of the day, gives back energy and a little health, and
 * leaves you warm through until the day ends, so the night's sleep heals more. One a day.
 */

export const SOAK_SLOTS = 1;
export const SOAK_ENERGY = 40;
export const SOAK_HEALTH = 8;

/** Warm through: what a soak leaves you with for the rest of the day. */
export const WARM_THROUGH: ModifierSpec = { sleepHealing: 1.2 };

/** The soak's buff while it lasts (`spendTime` clears it when the day ends). */
export function soakSpec(character: Character): ModifierSpec {
  return character.soaked ? WARM_THROUGH : {};
}
