import type { CombatTechnique } from '../../contract';
export { effortOf } from '../../rules/breath';
import { breathed, effortOf, maxBreath } from '../../rules/breath';
import { paying, type PlanFighter } from './state';

/**
 * What a technique costs its user in this fight, and from which pool: a body move spends breath
 * (`rules/breath.ts`) and can be thrown while sealed, anything else spends chakra. Ask here,
 * never `chakraCost` alone, so the two pools are told apart in one place.
 */

type Spender = Pick<PlanFighter, 'attributes' | 'chakra' | 'sealed' | 'breath'>;

/** The fighter's breath now: all of it until they have spent some. */
export function breathOf(f: Pick<PlanFighter, 'attributes' | 'breath'>): number {
  return f.breath ?? maxBreath(f.attributes);
}

/** Chakra a technique would take from this fighter: none for a body move. */
export function chakraTaken(f: Pick<PlanFighter, 'attributes'>, t: CombatTechnique): number {
  const effort = effortOf(f, t);
  return effort.pool === 'chakra' ? effort.amount : 0;
}

/** Whether the fighter can pay for it now (a seal stops chakra, never breath). */
export function affords(f: Spender, t: CombatTechnique): boolean {
  const { pool, amount } = effortOf(f, t);
  return pool === 'breath' ? amount <= breathOf(f) : f.sealed === 0 && amount <= f.chakra;
}

/** What paying for it changes on the fighter. */
export function payFor(
  f: Pick<PlanFighter, 'attributes' | 'chakra' | 'chakraSpent' | 'breath'>,
  t: CombatTechnique,
): Partial<PlanFighter> {
  const { pool, amount } = effortOf(f, t);
  return pool === 'breath' ? { breath: Math.max(0, breathOf(f) - amount) } : paying(f, amount);
}

/** Breath after the exchange's rest; untouched while it is full. */
export function rested(f: PlanFighter): Partial<PlanFighter> {
  return f.breath === undefined ? {} : { breath: breathed(f.breath, f.attributes) };
}
