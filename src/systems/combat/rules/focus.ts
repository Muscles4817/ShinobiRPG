import type { Discipline, Verb } from '@/systems/techniques';

import type { CombatFocus, CombatGear, FocusTarget } from '../gearContract';
import { rankStep } from './gearRank';

/**
 * What a focus does, in every fight style: it sharpens one verb or one art. Every effect it
 * covers is driven harder (`driveOf` in `verbs/use.ts`), so a seal lands more often and bites
 * deeper, a confusion takes hold more often and holds longer, a heal restores more. A better
 * rank sharpens more. A weapon may be a focus too.
 */

const FOCUS_BASE = 1.12;
const FOCUS_PER_RANK = 0.06;

/** How much a focus multiplies the drive of what it covers. */
export function focusScale(focus: Pick<CombatFocus, 'rank'>): number {
  return FOCUS_BASE + FOCUS_PER_RANK * rankStep(focus.rank);
}

function covers(boosts: FocusTarget, verb: Verb, discipline: Discipline): boolean {
  return 'verb' in boosts ? boosts.verb === verb : boosts.discipline === discipline;
}

/**
 * The drive multiplier the fighter's foci give one effect: 1 when none covers it. A weapon in
 * hand that is also a focus (a war fan for wind) counts beside a charm.
 */
export function focusDrive(
  f: { readonly gear?: CombatGear },
  verb: Verb,
  discipline: Discipline,
): number {
  const foci = [f.gear?.focus, f.gear?.held].flatMap((piece) =>
    piece?.boosts && covers(piece.boosts, verb, discipline) ? [focusScale(piece)] : [],
  );
  return foci.reduce((drive, scale) => drive * scale, 1);
}
