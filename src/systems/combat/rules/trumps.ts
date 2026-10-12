import type { CombatCost, CombatTechnique } from '../contract';

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
