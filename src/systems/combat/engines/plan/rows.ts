import { canReach, reachable, type RowAttack } from '../../rules/rows';
import { RANGE_BANDS, reachOf, STRIKE_REACH, THROW_REACH } from '../../rules/range';
import { hasVerb } from '../../rules/verbs';
import type { Card } from './cards';
import type { PlanFighter } from './state';

/**
 * Rows in a planned fight: which foes a card can reach past the front row (`rules/rows.ts`
 * holds the rule). Blows and counters only reach up close, so a screened back row is out of
 * their reach; kunai, explosive tags, techniques that reach further and area techniques are not.
 */

/** How a card reaches, as rows see it. Cards that don't attack reach anywhere. */
export function attackOf(card: Card): RowAttack {
  switch (card.kind) {
    case 'strike':
      return { reach: card.reach ?? STRIKE_REACH };
    case 'counter':
      return { reach: STRIKE_REACH };
    case 'throw':
      return { reach: THROW_REACH };
    case 'jutsu':
      return { reach: reachOf(card.technique), area: hasVerb(card.technique, 'area') };
    case 'item':
    case 'step':
    case 'guard':
    case 'dodge':
    case 'search':
    case 'dispel':
      return { reach: RANGE_BANDS };
  }
}

/** Whether a card can reach this foe past their front row. */
export function canHit(card: Card, foe: PlanFighter, fighters: readonly PlanFighter[]): boolean {
  return canReach(attackOf(card), foe, fighters);
}

/** The foes a card can reach past their front row. */
export function hittable(
  card: Card,
  foes: readonly PlanFighter[],
  fighters: readonly PlanFighter[],
): PlanFighter[] {
  return reachable(attackOf(card), foes, fighters);
}
