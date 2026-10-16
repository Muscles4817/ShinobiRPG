/**
 * Ladders: power a fighter climbs a step at a time within a fight (the Eight Gates are the
 * reference). An empower may open a step (`opens`), and a technique may need a step open to be
 * used at all (`TechniqueDef.needsOpen`: Daytime Tiger needs the seventh gate). One opening
 * climbs at most `LADDER_REACH` steps past the one already open (the third gate, then the seventh), so the deep steps are reached
 * through the shallow ones. What each step does in a fight lives in `combat/rules/verbs/ladders.ts`.
 */

export const LADDERS = ['gates'] as const;
export type LadderId = (typeof LADDERS)[number];

export interface LadderStep {
  readonly ladder: LadderId;
  /** 1 is the first step; the top is `LADDER_TOP`. */
  readonly step: number;
}

/** The last step of each ladder. */
export const LADDER_TOP: Readonly<Record<LadderId, number>> = { gates: 8 };

/** How many steps one opening may climb past the step already open. */
export const LADDER_REACH = 4;

/** Why a ladder step can't be, or null. */
export function ladderStepProblem({ ladder, step }: LadderStep): string | null {
  const ladders: readonly string[] = LADDERS;
  if (!ladders.includes(ladder)) return `an unknown ladder "${ladder}"`;
  return Number.isInteger(step) && step >= 1 && step <= LADDER_TOP[ladder]
    ? null
    : `step ${step} of the ${ladder} ladder (it runs 1 to ${LADDER_TOP[ladder]})`;
}

/** Whether an opening to `to` may be made with `from` already open. */
export function canClimb(from: number, to: number): boolean {
  return to > from && to - from <= LADDER_REACH;
}

/** The highest step these openings reach from nothing, each climbed from one already open. */
export function highestReachable(openings: readonly number[]): number {
  let top = 0;
  for (const step of [...openings].sort((a, b) => a - b)) {
    if (canClimb(top, step)) top = step;
  }
  return top;
}

const ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth'];

/** What one step of each ladder is called. */
const STEP_NOUN: Readonly<Record<LadderId, string>> = { gates: 'gate' };

/** A step in words, never a number: "the third gate". */
export function stepWords({ ladder, step }: LadderStep): string {
  return `the ${ORDINALS[step - 1] ?? 'last'} ${STEP_NOUN[ladder]}`;
}
