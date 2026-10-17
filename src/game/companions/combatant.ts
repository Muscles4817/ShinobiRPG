import type { CombatantSetup } from '@/systems/combat';
import { ordersOpen } from '@/systems/companions';
import { MAX_HEALTH } from '@/systems/vitals';

import { attributesOf } from '../combatants';
import type { GameContext } from '../context';
import type { GameState } from '../state';
import { kindOf, playerCompanion } from './make';

/**
 * Your companion in a fight: one more fighter on your side (it hits no harder for being
 * yours), by its own judgement, taking only the orders your bond with it has earned
 * (`ordersOpen`: stances first, then its cards; a wild kind later).
 */

const PREFIX = 'companion:';

/** Whether a combatant id is someone's companion (not a teammate). */
export function isCompanionCombatant(id: string): boolean {
  return id.startsWith(PREFIX);
}

/** Your companion as a fighter beside you, or none. */
export function companionAllies(state: GameState, ctx: GameContext): CombatantSetup[] {
  const companion = playerCompanion(state);
  if (!companion) return [];
  const kind = kindOf(companion, ctx);
  const open = ordersOpen(companion.bond, kind.temperament);
  const notYet = `${companion.name} doesn’t take that from you yet. Spend more time together.`;
  const health = Math.round(MAX_HEALTH * kind.healthScale);
  return [
    {
      id: `${PREFIX}${companion.id}`,
      name: companion.name,
      tag: kind.name,
      attributes: attributesOf(companion.stats),
      health,
      maxHealth: health,
      chakra: kind.maxChakra,
      maxChakra: kind.maxChakra,
      techniques: [],
      ...(kind.traits ? { traits: kind.traits } : {}),
      orders: {
        ...(open.stance ? {} : { stanceLocked: notYet }),
        ...(open.cards ? {} : { cardsLocked: notYet }),
      },
    },
  ];
}
