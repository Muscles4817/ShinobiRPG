import { round1 } from '@/core';
import { unmetRequirements, type StatDelta, type StatId, type Stats } from '@/systems/stats';

export type Discipline = 'taijutsu' | 'ninjutsu' | 'genjutsu';
export type Element = 'fire' | 'water' | 'earth' | 'wind' | 'lightning';
/** What a technique does when used. The combat engine decides how to interpret it. */
export type TechniqueEffect = 'damage' | 'stun' | 'heal';

export interface TechniqueDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly discipline: Discipline;
  readonly element?: Element;
  readonly effect: TechniqueEffect;
  readonly chakraCost: number;
  /** Strength of the effect (damage dealt, stun potency, health restored). */
  readonly power: number;
  /** Minimum stats needed to begin studying the technique. */
  readonly requirements: StatDelta;
  /** Total study points needed to master it. */
  readonly difficulty: number;
}

/** Techniques the character has mastered, plus partial study progress on others. */
export interface TechniqueBook {
  readonly known: readonly string[];
  readonly progress: Readonly<Record<string, number>>;
}

export const EMPTY_BOOK: TechniqueBook = { known: [], progress: {} };

export type LearnBlocker =
  | { readonly kind: 'already-known' }
  | { readonly kind: 'requirements'; readonly unmet: readonly StatId[] };

export function learnBlocker(
  book: TechniqueBook,
  def: TechniqueDef,
  stats: Stats,
): LearnBlocker | null {
  if (book.known.includes(def.id)) return { kind: 'already-known' };
  const unmet = unmetRequirements(stats, def.requirements);
  return unmet.length > 0 ? { kind: 'requirements', unmet } : null;
}

/** Study points earned in one session — sharper minds and steadier chakra learn faster. */
export function studyPoints(stats: Stats, def: TechniqueDef): number {
  const aptitude = stats[def.discipline] * 0.6 + stats.intellect * 0.4 + stats.chakraControl * 0.2;
  return round1(10 + aptitude);
}

export interface StudyResult {
  readonly book: TechniqueBook;
  readonly mastered: boolean;
  readonly progress: number;
}

export function study(book: TechniqueBook, def: TechniqueDef, points: number): StudyResult {
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
    book: { known: [...book.known, def.id], progress: remaining },
    mastered: true,
    progress: def.difficulty,
  };
}

export function knows(book: TechniqueBook, id: string): boolean {
  return book.known.includes(id);
}
