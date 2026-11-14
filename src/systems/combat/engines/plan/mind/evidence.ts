import { statTier, type StatGrade } from '@/systems/stats';

import type { Evidence } from './shape';

/**
 * Confidence from evidence, not a dial (`docs/design/combat-ai-plan.md` Part 5): a hypothesis's
 * confidence is its weighted evidence against the evidence both ways, pulled towards its prior by
 * a weight a sharper mind gives less (it learns faster), and older evidence fades by how readily
 * the mind lets go of a first impression. Intellect stands in for adaptability until fighting
 * identities are derived (Part 4).
 */

/** The prior's pull: a dull mind needs more evidence to move off it. */
const PRIOR_WEIGHT: Readonly<Record<StatGrade, number>> = {
  E: 4,
  D: 3,
  C: 2,
  B: 1.5,
  A: 1,
  S: 0.75,
};

/** How much of last exchange's evidence is kept: an adaptable mind forgets the opening sooner. */
const RETENTION: Readonly<Record<StatGrade, number>> = {
  E: 0.98,
  D: 0.96,
  C: 0.94,
  B: 0.92,
  A: 0.9,
  S: 0.88,
};

/** The words a confidence is said in, and where each begins. */
export const SURE_FROM = 0.9;
export const FAIRLY_FROM = 0.65;

export type Sureness = 'sure' | 'fairly sure' | 'maybe';

interface Mind {
  readonly attributes: { readonly intellect: number };
}

function gradeOf(mind: Mind): StatGrade {
  return statTier(mind.attributes.intellect).grade;
}

export const NO_EVIDENCE: Evidence = { seen: 0, against: 0, at: 0 };

/** How sure a mind is of a hypothesis with this prior, from the evidence alone. */
export function confidence(mind: Mind, evidence: Evidence, prior: number): number {
  const k = PRIOR_WEIGHT[gradeOf(mind)];
  return (evidence.seen + prior * k) / (evidence.seen + evidence.against + k);
}

/** Evidence as a mind still holds it some exchanges after it was last added to. */
export function faded(mind: Mind, evidence: Evidence, now: number): Evidence {
  const keep = RETENTION[gradeOf(mind)] ** Math.max(0, now - evidence.at);
  return { seen: evidence.seen * keep, against: evidence.against * keep, at: now };
}

/** Evidence with an observation added, for (`weight` > 0) or against (`weight` < 0). */
export function weighed(
  mind: Mind,
  evidence: Evidence,
  change: { weight: number; now: number },
): Evidence {
  const was = faded(mind, evidence, change.now);
  return change.weight >= 0
    ? { ...was, seen: was.seen + change.weight }
    : { ...was, against: was.against - change.weight };
}

export function surenessOf(c: number): Sureness {
  if (c >= SURE_FROM) return 'sure';
  return c >= FAIRLY_FROM ? 'fairly sure' : 'maybe';
}
