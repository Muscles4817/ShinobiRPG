import { isOffence, type Card } from '@/systems/combat/engines/plan/cards';
import type { PlanFighter } from '@/systems/combat/engines/plan/state';

import { inView } from './infer';

/**
 * Today's telegraph (`intent.ts`), as a reader: when the foe is in view it always tells the true
 * class, and names the technique or tool with insight or perception at least the foe's
 * (`readsPrecisely`). Today's slot conditions read the announced card itself, whatever the
 * player's eyes (`conditions.ts`).
 */
export interface TodayRead {
  readonly told: boolean;
  readonly named: boolean;
}

export function readsPrecisely(viewer: PlanFighter, foe: PlanFighter, insight: boolean): boolean {
  return insight || viewer.attributes.perception >= foe.attributes.perception;
}

export function today(
  observer: PlanFighter,
  actor: PlanFighter,
  insight: boolean,
  card: Card,
): TodayRead {
  if (!inView(observer, actor)) return { told: false, named: false };
  const nameable = card.kind === 'jutsu' || card.kind === 'item';
  return { told: true, named: nameable && readsPrecisely(observer, actor, insight) };
}

/** The three telegraph conditions as today's engine reads them, on the true card. */
export function conditionsOf(card: Card) {
  return {
    'foe-readying': card.kind === 'jutsu',
    'foe-attacking': isOffence(card),
    'foe-closing': card.kind === 'step' && card.direction === 'in',
  };
}
