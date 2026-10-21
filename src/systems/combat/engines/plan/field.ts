import type { Rng } from '@/core';

import type { CombatMeter } from '../../contract';
import {
  blinds,
  driveOf,
  FIELD_RULES,
  fieldLeft,
  fieldMissChance,
  fieldPotency,
  raiseField,
  type ActiveField,
  type EffectUse,
} from '../../rules/verbs';
import { say, type PlanFighter, type PlanState, type Round } from './state';
import { tell } from '../../rules/telling';

/**
 * Fields in a planned fight: a field technique raises one over the whole fight (replacing any
 * other), it covers a few exchanges, and the fight screen shows it as a meter while it lasts.
 * What a field does to those inside it is `rules/verbs/field.ts`.
 */

export function castField(round: Round, actor: PlanFighter, use: EffectUse<'field'>): Round {
  const potency = fieldPotency(driveOf(actor, use), use);
  const source = { id: use.effect.field, side: actor.side, potency, power: use.effect.power };
  const field = raiseField(source, round.number);
  return say({ ...round, field }, FIELD_RULES[field.id].rises);
}

/** Whether a field of this fighter's own side is over the fight. */
export function ownField(field: ActiveField | undefined, f: PlanFighter): boolean {
  return field?.side === f.side;
}

/** When the fighter's attack goes wide in the field, what is said; else null. */
export function lostInField(round: Round, actor: PlanFighter, rng: Rng): string | null {
  const { field } = round;
  const chance = fieldMissChance(field, actor);
  if (!field || chance <= 0 || !rng.chance(chance)) return null;
  const where = FIELD_RULES[field.id].name.toLowerCase();
  return tell('{a} strike{a.s} at a shape in the {where} and find{a.s} no one.', {
    a: actor,
    where,
  });
}

/** At the end of an exchange: a field whose last exchange this was fades. */
export function fieldAfter(
  field: ActiveField | undefined,
  exchange: number,
): { readonly field?: ActiveField; readonly lines: readonly string[] } {
  if (!field) return { lines: [] };
  if (field.until > exchange) return { field, lines: [] };
  return { lines: [FIELD_RULES[field.id].fades] };
}

/** The field as the fight screen shows it: whose, and how many exchanges are left. */
export function fieldMeter(state: PlanState): CombatMeter | null {
  const { field } = state;
  if (!field || state.result) return null;
  const name = FIELD_RULES[field.id].name;
  return {
    id: 'field',
    label: field.side === 'player' ? `Your ${name.toLowerCase()}` : `Their ${name.toLowerCase()}`,
    value: fieldLeft(field, state.round),
    max: field.exchanges,
  };
}

/** A status for fighters the field blinds. */
export function fieldStatuses(state: Pick<PlanState, 'field'>, f: PlanFighter): string[] {
  return blinds(state.field, f) ? ['Blinded'] : [];
}
