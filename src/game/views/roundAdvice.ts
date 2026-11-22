import type { CauseKind, CombatView, NarrationCause, NarrationReaction } from '@/systems/combat';

import { lastRound, type RoundRead } from './roundEvents';
import { causesFor, reactionsIn, yourAttacksMet } from './roundWhy';

/**
 * One thing to try next round (audit P1.3), or nothing: drawn only from what the engine's own
 * rules prove, read from the round just played. A Counter answers hand-to-hand blows, so a
 * technique or a throw doesn't walk into it; nothing slotted fitting means a card is missing for
 * this distance; steps that keep failing say stay where you are; a move read from use wants
 * changing up (`rules/familiarity.ts`); and each ready defence has what gets past it (`beats` in
 * the plan engine's `adapt.ts`): a guard-breaker or a flurry on a Guard, an illusion or a sure
 * technique on a Dodge, an illusion on a substitution. A suggestion that might be wrong is worse
 * than none, so it takes the same thing happening twice (once for a Counter, which hurts).
 * Whose defence met whose attack, and whom a cause is about, are the events' own fields.
 */

/** How often something must happen in a round before it is worth a word. */
export const ADVICE_AFTER = 2;

/** Failed steps that say the step itself is the problem: outrun, cut off, held off, walled in. */
const STOPPED_STEPS: readonly NarrationCause[] = ['outpaced', 'cut-off', 'held-off', 'no-room'];

interface Rule {
  readonly when: (round: RoundRead, you: string) => boolean;
  readonly advice: string;
}

/** Your attacks met this defence of a foe's this many times. */
function met(reaction: NarrationReaction, times = ADVICE_AFTER) {
  return (round: RoundRead, you: string) =>
    yourAttacksMet(round, you).filter((r) => r.reaction === reaction).length >= times;
}

/** Causes of this kind (or only these causes of it) were about you this many times. */
function caused(kind: CauseKind, only?: readonly NarrationCause[]) {
  return (round: RoundRead, you: string) => {
    const causes = causesFor(round, you).get(kind) ?? [];
    return causes.filter((c) => !only || only.includes(c)).length >= ADVICE_AFTER;
  };
}

/** A foe's Counter answered an attack of yours. */
function countered(round: RoundRead, you: string): boolean {
  return reactionsIn(round.told).some(
    (r) => r.reaction === 'countered' && r.on === you && r.by !== you,
  );
}

function offPlan(round: RoundRead, you: string): boolean {
  const improvised = round.told.filter((t) => t.actor === you && t.offPlan === 'improvised');
  return improvised.length >= ADVICE_AFTER;
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
    // Steps the foes stopped or the ground did; held fast or followed, a step isn't the problem.
    when: caused('step-failed', STOPPED_STEPS),
    advice: 'Your steps keep failing. Fight from where you stand, or slot what reaches from here.',
  },
  {
    when: caused('slipped', ['familiar']),
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
  const round = lastRound(view.story);
  if (!you || !round) return null;
  return RULES.find((rule) => rule.when(round, you.id))?.advice ?? null;
}
