/**
 * Conduct: what the examiners write down about how you went about it. Each stage records
 * judgement signals (helping your team, a sensible withdrawal, not cheating badly, how you won)
 * as marks, and the verdict weighs their sum with your results. Every signal's worth lives here.
 */

/** Signals the examiners note, with what each is worth. */
export const CONDUCT_POINTS = {
  /** You stayed for the written test's last question. */
  'stayed-for-final': 2,
  /** A proctor caught you cheating. */
  'caught-cheating': -2,
  /** You pulled your team out of a fight it couldn't win. */
  'sensible-withdrawal': 2,
  /** You pulled out of a fight you could have taken. */
  'gave-up': -1,
  /** You got past rivals without a fight. */
  'avoided-fight': 1,
  /** You won a fight in the forest with your whole team on its feet. */
  'team-standing': 1,
  /** You won a fight in the forest, but a teammate went down. */
  'teammate-down': -1,
  /** You won a bout with a plan: techniques, not just fists. */
  'clever-win': 1,
  /** You yielded a bout you were losing badly. */
  'sensible-yield': 1,
  /** You yielded a bout you were still in. */
  'early-yield': -1,
} as const;

export type ConductSignal = keyof typeof CONDUCT_POINTS;

export const CONDUCT_SIGNALS = Object.keys(CONDUCT_POINTS) as readonly ConductSignal[];

/** One note in the examiners' book. */
export interface ConductMark {
  readonly signal: ConductSignal;
  readonly points: number;
}

export function conductMark(signal: ConductSignal): ConductMark {
  return { signal, points: CONDUCT_POINTS[signal] };
}

export function conductScore(marks: readonly ConductMark[]): number {
  return marks.reduce((sum, m) => sum + m.points, 0);
}
