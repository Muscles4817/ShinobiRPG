import { hashUnit } from '@/core';
import { bornLine, bornMedian, normalFrom, type BornLine, type Sex } from '@/systems/stats';

/**
 * A person's body and mind at graduation, drawn from a seed by hash (never the game's dice), so
 * creation can show what the game will start with, and the same seed always draws the same
 * person. The same draws serve either sex, so changing it moves the body along its curve.
 */
/** A null seed is the middle of the class (sandboxes, quick tests). */
export function bornFor(seed: number | null, sex: Sex): BornLine {
  if (seed === null) return bornMedian(sex);
  return bornLine(sex, (stat) =>
    normalFrom(1 - hashUnit(seed, 'born', stat, 'a'), hashUnit(seed, 'born', stat, 'b')),
  );
}
