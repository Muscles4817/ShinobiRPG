import type { ModifierSpec } from '@/systems/modifiers';
import { sumDeltas, type StatDelta } from '@/systems/stats';

import type { Breakthrough, Character } from './state';

/**
 * Breakthroughs: what moves a natural limit. Training never does (`systems/stats/limits.ts`);
 * a breakthrough is an event that does, recorded on the character with where it came from, so
 * the limits it moved stay moved. Today a promotion is one (a chūnin's and a jōnin's body has
 * been through more, and their reserves have deepened with it); the Gates, a bloodline
 * awakening or a sensei's trial are the same kind of thing.
 */

/** A breakthrough, once: the same source never counts twice. */
export function withBreakthrough(character: Character, breakthrough: Breakthrough): Character {
  if (character.breakthroughs.some((b) => b.source === breakthrough.source)) return character;
  return { ...character, breakthroughs: [...character.breakthroughs, breakthrough] };
}

/** Every breakthrough's limits, as one spec for `characterModifiers`. */
export function breakthroughSpec(character: Character): ModifierSpec {
  const limits: StatDelta = sumDeltas(...character.breakthroughs.map((b) => b.limits));
  return { limitBonus: limits };
}
