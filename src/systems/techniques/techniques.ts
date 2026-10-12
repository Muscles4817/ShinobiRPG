import { round1 } from '@/core';
import type { StatGrade, Stats } from '@/systems/stats';

import type { CostTemplate } from './costs';
import type { TechniqueEffect } from './effects';
import {
  controlStudyFactor,
  gradeIndex,
  gradeOf,
  learnability,
  SOURCE_QUALITY,
  UNSTABLE_STUDY,
  type Learnability,
  type StudySource,
} from './learning';

export const DISCIPLINES = ['taijutsu', 'ninjutsu', 'genjutsu', 'kenjutsu', 'fuuinjutsu'] as const;
export type Discipline = (typeof DISCIPLINES)[number];
export const ELEMENTS = ['fire', 'wind', 'lightning', 'earth', 'water'] as const;
export type Element = (typeof ELEMENTS)[number];

export interface TechniqueDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly discipline: Discipline;
  readonly element?: Element;
  /** What it does, in order (damage, then daze…). Never empty (validated). */
  readonly effects: readonly TechniqueEffect[];
  readonly chakraCost: number;
  /** How advanced it is, in the letters of ability grades (see `learning.ts`). */
  readonly rank: StatGrade;
  /** What the body must have to use it at all, whatever the learner's grade. */
  readonly needs?: TechniqueNeeds;
  /** Total study points needed to master it. */
  readonly difficulty: number;
  /** Only members of this clan may learn it. */
  readonly clan?: string;
  /** A trump card: usable once per fight. */
  readonly oncePerFight?: true;
  /** What using it costs its user once the fight is over (validated: trump cards only). */
  readonly afterCost?: CostTemplate;
  /**
   * A combination technique: playable only beside a fighter on your side who knows the partner
   * technique (and isn't dazed); both go off together, harder than either alone.
   */
  readonly combo?: { readonly partnerTechniqueId: string };
}

/**
 * Hard requirements where the body must have something: a chakra nature, deep enough reserves,
 * a grade of chakra control. (A clan or bloodline is `TechniqueDef.clan`.)
 */
export interface TechniqueNeeds {
  readonly nature?: Element;
  readonly minReserves?: number;
  readonly control?: StatGrade;
}

/**
 * Techniques the character has mastered, plus partial study progress on others. Unstable ones
 * (learned a rank above the learner's grade) are known too, and listed again in `unstable`
 * until the learner's grade catches up.
 */
export interface TechniqueBook {
  readonly known: readonly string[];
  readonly progress: Readonly<Record<string, number>>;
  readonly unstable: readonly string[];
}

export const EMPTY_BOOK: TechniqueBook = { known: [], progress: {}, unstable: [] };

/** Who is learning: what their grades, clan and nature allow. */
export interface Learner {
  readonly stats: Stats;
  readonly clanId: string;
  readonly nature: Element;
}

export type LearnBlocker =
  | { readonly kind: 'already-known' }
  | { readonly kind: 'clan'; readonly clan: string }
  | { readonly kind: 'rank'; readonly rank: StatGrade; readonly grade: StatGrade }
  | { readonly kind: 'nature'; readonly nature: Element }
  | { readonly kind: 'reserves'; readonly min: number; readonly have: number }
  | { readonly kind: 'control'; readonly grade: StatGrade; readonly have: StatGrade };

/** How a technique stands against the learner's grade in its discipline. */
export function learnabilityFor(def: TechniqueDef, stats: Stats): Learnability {
  return learnability(def.rank, gradeOf(stats[def.discipline]));
}

function needsBlocker(needs: TechniqueNeeds, learner: Learner): LearnBlocker | null {
  const { stats } = learner;
  if (needs.nature !== undefined && needs.nature !== learner.nature) {
    return { kind: 'nature', nature: needs.nature };
  }
  if (needs.minReserves !== undefined && stats.reserves < needs.minReserves) {
    return { kind: 'reserves', min: needs.minReserves, have: stats.reserves };
  }
  const control = gradeOf(stats.chakraControl);
  if (needs.control !== undefined && gradeIndex(control) < gradeIndex(needs.control)) {
    return { kind: 'control', grade: needs.control, have: control };
  }
  return null;
}

/** Why the learner can't study this technique (from any source), or null if they can. */
export function learnBlocker(
  book: TechniqueBook,
  def: TechniqueDef,
  learner: Learner,
): LearnBlocker | null {
  if (book.known.includes(def.id)) return { kind: 'already-known' };
  if (def.clan !== undefined && def.clan !== learner.clanId) {
    return { kind: 'clan', clan: def.clan };
  }
  if (learnabilityFor(def, learner.stats) === 'impossible') {
    return { kind: 'rank', rank: def.rank, grade: gradeOf(learner.stats[def.discipline]) };
  }
  return def.needs ? needsBlocker(def.needs, learner) : null;
}

/** Study points earned in one session — sharper minds and steadier chakra learn faster. */
export function studyPoints(stats: Stats, def: TechniqueDef): number {
  const aptitude = stats[def.discipline] * 0.6 + stats.intellect * 0.4 + stats.chakraControl * 0.2;
  return round1(10 + aptitude);
}

/** The arts worked with chakra, where control steadies study. */
const CHAKRA_ARTS: readonly Discipline[] = ['ninjutsu', 'genjutsu', 'fuuinjutsu'];

export interface StudyConditions {
  /** The learner's talent in the technique's discipline. */
  readonly aptitude: number;
  readonly source: StudySource;
}

/**
 * One session's study: the base points × aptitude in the art × chakra control (chakra arts) ×
 * the source's quality, at half pace for a technique a rank above the learner.
 */
export function sessionStudyPoints(
  stats: Stats,
  def: TechniqueDef,
  { aptitude, source }: StudyConditions,
): number {
  const control = CHAKRA_ARTS.includes(def.discipline)
    ? controlStudyFactor(stats.chakraControl)
    : 1;
  const unstable = learnabilityFor(def, stats) === 'unstable' ? UNSTABLE_STUDY : 1;
  return studyPoints(stats, def) * aptitude * control * SOURCE_QUALITY[source] * unstable;
}

export interface StudyResult {
  readonly book: TechniqueBook;
  readonly mastered: boolean;
  readonly progress: number;
}

/**
 * A session of study. `unstable` says the technique, once mastered, arrives unstable (it was a
 * rank above the learner).
 */
export function study(
  book: TechniqueBook,
  def: TechniqueDef,
  points: number,
  unstable = false,
): StudyResult {
  const progress = round1((book.progress[def.id] ?? 0) + points);
  if (progress < def.difficulty) {
    return {
      book: { ...book, progress: { ...book.progress, [def.id]: progress } },
      mastered: false,
      progress,
    };
  }
  const { [def.id]: _done, ...remaining } = book.progress;
  return {
    book: {
      known: [...book.known, def.id],
      progress: remaining,
      unstable: unstable ? [...book.unstable, def.id] : book.unstable,
    },
    mastered: true,
    progress: def.difficulty,
  };
}

export function knows(book: TechniqueBook, id: string): boolean {
  return book.known.includes(id);
}

/** Known techniques that are unstable for someone with these stats (a rank above their grade). */
export function unstableFor(
  known: readonly string[],
  stats: Stats,
  techniqueOf: (id: string) => TechniqueDef | undefined,
): string[] {
  return known.filter((id) => {
    const def = techniqueOf(id);
    return def !== undefined && gradeIndex(def.rank) > gradeIndex(gradeOf(stats[def.discipline]));
  });
}

/** Unstable techniques whose rank the learner's grade has now reached. */
export function steadied(
  book: TechniqueBook,
  stats: Stats,
  techniqueOf: (id: string) => TechniqueDef | undefined,
): string[] {
  const still = unstableFor(book.unstable, stats, techniqueOf);
  return book.unstable.filter((id) => !still.includes(id));
}

/** The book with these techniques stable. */
export function steady(book: TechniqueBook, ids: readonly string[]): TechniqueBook {
  return { ...book, unstable: book.unstable.filter((id) => !ids.includes(id)) };
}
