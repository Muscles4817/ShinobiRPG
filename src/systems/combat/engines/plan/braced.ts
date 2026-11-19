import { clamp } from '@/core';

import { findCard } from './cards';
import { committedTo } from './commitment';
import { bandOf } from './distance';
import type { PlanFighter, Round } from './state';

/**
 * Braced for an illusion (`docs/design/combat-ai-plan.md` Part 13c): someone who expects one
 * meets it with their own chakra control as it lands, and is far likelier to shake it off. They
 * expect it once they have seen this foe cast an illusion this fight, while they dig in (a Brace)
 * or while they keep a Dispel to hand where they stand. How much more often they shake it off is
 * their control against the caster's genjutsu, up to `BRACED_MOST`.
 */

/** The most a braced mind adds to shaking an illusion off: a share of what would have landed. */
export const BRACED_MOST = 0.6;

function castIllusionBefore(round: Round, caster: PlanFighter): boolean {
  const seen = round.seen[caster.id] ?? [];
  return seen.some((id) => {
    const card = findCard(caster, id);
    return card?.kind === 'jutsu' && card.technique.discipline === 'genjutsu';
  });
}

function keepsDispel(round: Round, target: PlanFighter): boolean {
  return target.loadout[bandOf(round, target)].some((s) => s.card === 'dispel');
}

/** Whether the target expects an illusion from this caster. */
export function bracedFor(round: Round, target: PlanFighter, caster: PlanFighter): boolean {
  return (
    committedTo(target, 'brace') || keepsDispel(round, target) || castIllusionBefore(round, caster)
  );
}

/** The added share of an illusion a braced target shakes off: their control against the art. */
export function bracedShake(target: PlanFighter, caster: PlanFighter): number {
  const control = Math.max(0, target.attributes.chakraControl);
  const art = Math.max(1, caster.attributes.genjutsu);
  return clamp((BRACED_MOST * control) / (control + art), 0, BRACED_MOST);
}

/** An illusion's chance of not landing, braced or not. */
export function bracedAvoid(
  round: Round,
  { target, caster, odds }: { target: PlanFighter; caster: PlanFighter; odds: number },
): number {
  if (!bracedFor(round, target, caster)) return odds;
  return odds + (1 - odds) * bracedShake(target, caster);
}
