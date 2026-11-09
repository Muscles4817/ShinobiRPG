import { alive } from '../../rules/body';
import { isPinned } from '../../rules/verbs';
import type { Card } from './cards';
import { isDazed } from './daze';
import { opponentsOf } from './senses';
import type { PlanFighter } from './state';

/**
 * Finishers that need an opening (`TechniqueDef.needsTarget`): a storm of blows like Morning
 * Peacock lands only on a target who is open, dazed or reeling or held fast, so it waits for
 * one; a plan's slot for it passes over foes still standing ready, and the instinct holds it back
 * until someone is open.
 */

/** Whether a card is a finisher that waits for an open target. */
export function needsOpenTarget(card: Card): boolean {
  return card.kind === 'jutsu' && card.technique.needsTarget === 'open';
}

/** Whether a fighter is open to a finisher: dazed, reeling or held. */
export function isOpen(f: PlanFighter): boolean {
  return isDazed(f) || isPinned(f);
}

/** The foes open to a finisher now. */
export function openFoes(self: PlanFighter, fighters: readonly PlanFighter[]): PlanFighter[] {
  return opponentsOf(fighters, self).filter((f) => alive(f) && isOpen(f));
}

/** Whom a card may go for among these foes: an open one, for a finisher that needs it. */
export function finisherTargets(card: Card, foes: readonly PlanFighter[]): PlanFighter[] {
  return needsOpenTarget(card) ? foes.filter(isOpen) : [...foes];
}
