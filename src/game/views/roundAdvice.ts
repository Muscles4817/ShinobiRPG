import type { CombatView, NarrationCause, NarrationReaction } from '@/systems/combat';

import { lastRound, read, type Line } from './roundWhy';

/**
 * One thing to try next round (audit P1.3), or nothing: drawn only from what the engine's own
 * rules prove, read from the round just played. A Counter answers hand-to-hand blows, so a
 * technique or a throw doesn't walk into it; nothing slotted fitting means a card is missing for
 * this distance; steps that keep failing say stay where you are; a move read from use wants
 * changing up (`rules/familiarity.ts`); and each ready defence has what gets past it (`beats` in
 * the plan engine's `adapt.ts`): a guard-breaker or a flurry on a Guard, an illusion or a sure
 * technique on a Dodge, an illusion on a substitution. A suggestion that might be wrong is worse
 * than none, so it takes the same thing happening twice (once for a Counter, which hurts).
 */

/** How often something must happen in a round before it is worth a word. */
export const ADVICE_AFTER = 2;

interface Rule {
  readonly when: (lines: readonly Line[], you: string) => boolean;
  readonly advice: string;
}

const yours = (lines: readonly Line[], you: string) => lines.filter((l) => l.said.actorId === you);

/** Your attacks met this defence of theirs this many times. */
function met(reaction: NarrationReaction, times = ADVICE_AFTER) {
  return (lines: readonly Line[], you: string) =>
    yours(lines, you).filter((l) => l.target !== you && l.said.reactions.includes(reaction))
      .length >= times;
}

/** Your lines carried one of these causes this many times. */
function caused(causes: readonly NarrationCause[]) {
  return (lines: readonly Line[], you: string) =>
    yours(lines, you).filter((l) => l.said.cause !== undefined && causes.includes(l.said.cause))
      .length >= ADVICE_AFTER;
}

/** A Counter's answer is told on the line as the counterer's: count the answers that hit you. */
function countered(lines: readonly Line[], you: string): boolean {
  return lines.some((l) => l.target === you && l.said.reactions.includes('countered'));
}

function offPlan(lines: readonly Line[], you: string): boolean {
  return yours(lines, you).filter((l) => l.said.offPlan === 'improvised').length >= ADVICE_AFTER;
}

const RULES: readonly Rule[] = [
  {
    when: countered,
    advice: 'They counter blows up close. A technique or a throw doesn’t walk into it.',
  },
  {
    when: offPlan,
    advice: 'Nothing you slotted fit here. Slot a card that works from this distance.',
  },
  {
    when: caused(['outpaced', 'cut-off', 'held-off']),
    advice: 'Your steps keep failing. Fight from where you stand, or slot what reaches from here.',
  },
  {
    when: caused(['familiar']),
    advice: 'They have read a move you keep using. Change it up.',
  },
  {
    when: met('guarded'),
    advice: 'They keep a Guard up. A guard-breaker or a flurry gets past it.',
  },
  {
    when: met('dodged'),
    advice: 'They keep a Dodge ready. An illusion or a sure technique is hard to slip.',
  },
  {
    when: met('swapped'),
    advice: 'They swap out of hits. An illusion gets past a substitution.',
  },
];

/** The one suggestion for the round just played, or null. */
export function roundAdvice(view: CombatView): string | null {
  const you = view.combatants.find((c) => c.side === 'player');
  if (!you) return null;
  const lines = lastRound(view.log).map((said) => read(said, view.combatants));
  return RULES.find((rule) => rule.when(lines, you.id))?.advice ?? null;
}
