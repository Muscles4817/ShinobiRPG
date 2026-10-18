/**
 * The special notes on an academy file (`TalentDef`), each weighed as a major note, a minor one
 * or a flaw. Class standing sets how many the file carries; a flaw makes room for one more minor
 * note, and a major slot left empty takes a minor note instead. There is no other limit: a file
 * filled to the brim is an easier game, one left bare a harder one.
 */

export const NOTE_WEIGHTS = ['major', 'minor', 'flaw'] as const;
export type NoteWeight = (typeof NOTE_WEIGHTS)[number];

/** What a standing lets the file carry. */
export interface NoteAllowance {
  readonly major: number;
  readonly minor: number;
}

/** Room left on the file: major slots, and minor ones (flaws and empty major slots count). */
export function notesLeft(weights: readonly NoteWeight[], allowance: NoteAllowance): NoteAllowance {
  const count = (w: NoteWeight) => weights.filter((x) => x === w).length;
  const major = allowance.major - count('major');
  const minor = allowance.minor + count('flaw') + Math.max(0, major) - count('minor');
  return { major, minor };
}

/** Why the file can't carry these notes, or null. */
export function notesProblem(
  weights: readonly NoteWeight[],
  allowance: NoteAllowance,
): string | null {
  const left = notesLeft(weights, allowance);
  if (left.major < 0) return 'Your standing can’t carry that many major notes.';
  return left.minor < 0 ? 'No room for another minor note: a flaw would make some.' : null;
}
