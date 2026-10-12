import { fightingPower } from '@/systems/stats';

import type { CombatAttributes, CombatCost, CombatTechnique } from '../contract';

/**
 * Trump cards: techniques usable once per fight, whose price (`afterCost`) comes due once the
 * fight is over. Engines keep the ids of the trumps a fighter has used; these rules decide
 * what that rules out and what it costs.
 */

/** What a fighter remembers of the trumps they have played. Absent in older saved fights. */
export interface TrumpMemory {
  readonly trumpsUsed?: readonly string[];
}

type Trump = Pick<CombatTechnique, 'id' | 'oncePerFight'>;

/** Below this share of their health a fighter reaches for their trump: the last-ditch moment. */
export const TRUMP_HEALTH = 1 / 3;
/**
 * A foe this much stronger (fighting power, theirs ÷ yours) is worth a trump from the start:
 * where scouting's "far stronger than you" begins.
 */
export const OUTMATCHED_RATIO = 1.4;

export function isTrump(technique: Pick<CombatTechnique, 'oncePerFight'>): boolean {
  return technique.oncePerFight === true;
}

/** Some foe is far stronger than this fighter: no point saving a trump for later. */
export function outmatched(
  self: { readonly attributes: CombatAttributes },
  foes: readonly { readonly attributes: CombatAttributes }[],
): boolean {
  const own = Math.max(1, fightingPower(self.attributes));
  return foes.some((foe) => fightingPower(foe.attributes) / own > OUTMATCHED_RATIO);
}

/** Hurt badly enough that a trump kept back would be wasted. */
export function lastDitch(f: { readonly health: number; readonly maxHealth: number }): boolean {
  return f.health < f.maxHealth * TRUMP_HEALTH;
}

/** A once-per-fight technique this fighter has already used. */
export function trumpSpent(fighter: TrumpMemory, technique: Trump): boolean {
  return technique.oncePerFight === true && (fighter.trumpsUsed ?? []).includes(technique.id);
}

/** The memory after using a technique: trumps are remembered, everything else isn't. */
export function afterUsing(fighter: TrumpMemory, technique: Trump): readonly string[] {
  const used = fighter.trumpsUsed ?? [];
  return technique.oncePerFight === true && !used.includes(technique.id)
    ? [...used, technique.id]
    : used;
}

/** The costs a fighter owes for the trumps they used, in the order they used them. */
export function costsOwed(
  fighter: TrumpMemory & { readonly techniques: readonly CombatTechnique[] },
): CombatCost[] {
  return (fighter.trumpsUsed ?? []).flatMap((id) => {
    const technique = fighter.techniques.find((t) => t.id === id);
    if (!technique?.afterCost) return [];
    return [{ techniqueId: id, techniqueName: technique.name, cost: technique.afterCost }];
  });
}
