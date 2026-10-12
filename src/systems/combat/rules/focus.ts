import type { Discipline, Verb } from '@/systems/techniques';

import type { CombatFocus, CombatGear } from '../gearContract';
import { rankStep } from './gearRank';

/**
 * What a focus does, in every fight style: it sharpens one verb or one art. Every effect it
 * covers is driven harder (`driveOf` in `verbs/use.ts`), so a seal lands more often and bites
 * deeper, a confusion takes hold more often and holds longer, a heal restores more. A better
 * rank sharpens more.
 */

const FOCUS_BASE = 1.12;
const FOCUS_PER_RANK = 0.06;

/** How much a focus multiplies the drive of what it covers. */
export function focusScale(focus: Pick<CombatFocus, 'rank'>): number {
  return FOCUS_BASE + FOCUS_PER_RANK * rankStep(focus.rank);
}

function covers(focus: CombatFocus, verb: Verb, discipline: Discipline): boolean {
  const { boosts } = focus;
  return 'verb' in boosts ? boosts.verb === verb : boosts.discipline === discipline;
}

/** The drive multiplier the fighter's focus gives one effect: 1 when it doesn't cover it. */
export function focusDrive(
  f: { readonly gear?: CombatGear },
  verb: Verb,
  discipline: Discipline,
): number {
  const focus = f.gear?.focus;
  return focus && covers(focus, verb, discipline) ? focusScale(focus) : 1;
}
