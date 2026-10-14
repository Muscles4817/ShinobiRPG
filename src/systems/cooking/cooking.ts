import { STAT_GRADES, type StatGrade } from '@/systems/stats';

/**
 * Cooking as a skill: the recipes you know, how often you've cooked each (mastery), and the
 * experience that raises your cooking grade E–S. A recipe's rank works like a technique's: one
 * above your grade you can manage, two above is beyond you. Pure functions over the slice.
 */

export interface Cooking {
  /** Experience from every dish cooked. */
  readonly xp: number;
  /** Recipes you know, by id, with how many times you've cooked each. */
  readonly known: Readonly<Record<string, number>>;
  /** The day each wild place (or fishing spot, `place:spot`) last gave you something. */
  readonly gathered: Readonly<Record<string, number>>;
}

export const NO_COOKING: Cooking = { xp: 0, known: {}, gathered: {} };

/** Experience needed for each grade, E first. */
export const GRADE_XP: Readonly<Record<StatGrade, number>> = {
  E: 0,
  D: 12,
  C: 45,
  B: 120,
  A: 280,
  S: 600,
};

/** Experience a dish is worth by its rank. */
export const XP_BY_RANK: Readonly<Record<StatGrade, number>> = {
  E: 1,
  D: 2,
  C: 3,
  B: 5,
  A: 8,
  S: 12,
};

/** Cooks after which a recipe is practised, then mastered. */
export const PRACTISED_AT = 5;
export const MASTERED_AT = 15;
/** A mastered dish teaches you this share of its experience. */
const MASTERED_XP_SHARE = 0.5;
/** How many grades above yours a recipe can be and still be cooked. */
const REACH_ABOVE_GRADE = 1;

export const MASTERY_STAGES = ['new', 'practised', 'mastered'] as const;
export type Mastery = (typeof MASTERY_STAGES)[number];

function gradeIndex(grade: StatGrade): number {
  return STAT_GRADES.indexOf(grade);
}

export function cookingGrade(xp: number): StatGrade {
  return STAT_GRADES.reduce<StatGrade>((best, g) => (xp >= GRADE_XP[g] ? g : best), 'E');
}

/** How far through the current grade, 0–1 (1 at S). */
export function gradeProgress(xp: number): number {
  const grade = cookingGrade(xp);
  const next = STAT_GRADES[gradeIndex(grade) + 1];
  if (next === undefined) return 1;
  return (xp - GRADE_XP[grade]) / (GRADE_XP[next] - GRADE_XP[grade]);
}

export function knowsRecipe(cooking: Cooking, recipeId: string): boolean {
  return cooking.known[recipeId] !== undefined;
}

export function timesCooked(cooking: Cooking, recipeId: string): number {
  return cooking.known[recipeId] ?? 0;
}

export function masteryOf(times: number): Mastery {
  if (times >= MASTERED_AT) return 'mastered';
  return times >= PRACTISED_AT ? 'practised' : 'new';
}

/** Whether a recipe of this rank is within reach of a cook of this grade. */
export function withinReach(grade: StatGrade, rank: StatGrade): boolean {
  return gradeIndex(rank) - gradeIndex(grade) <= REACH_ABOVE_GRADE;
}

/** Learns recipes you don't know yet (never resets one you do). */
export function learnRecipes(cooking: Cooking, recipeIds: readonly string[]): Cooking {
  const fresh = recipeIds.filter((id) => !knowsRecipe(cooking, id));
  if (fresh.length === 0) return cooking;
  return {
    ...cooking,
    known: { ...cooking.known, ...Object.fromEntries(fresh.map((id) => [id, 0])) },
  };
}

/** Experience a dish gives now: its rank's worth, half once you've mastered it. */
export function xpFor(rank: StatGrade, times: number): number {
  const base = XP_BY_RANK[rank];
  return masteryOf(times) === 'mastered' ? Math.max(1, Math.round(base * MASTERED_XP_SHARE)) : base;
}

/** After cooking a known recipe once: one more time cooked, and its experience. */
export function cookedOnce(cooking: Cooking, recipeId: string, rank: StatGrade): Cooking {
  const times = timesCooked(cooking, recipeId);
  return {
    ...cooking,
    xp: cooking.xp + xpFor(rank, times),
    known: { ...cooking.known, [recipeId]: times + 1 },
  };
}
