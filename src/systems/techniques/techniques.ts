import { round1 } from '@/core';
import { unmetRequirements, type StatDelta, type StatId, type Stats } from '@/systems/stats';

import type { CostTemplate } from './costs';
import type { TechniqueEffect } from './effects';

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
  /** Minimum stats needed to begin studying the technique. */
  readonly requirements: StatDelta;
  /** Total study points needed to master it. */
  readonly difficulty: number;
  /** Only members of this clan may learn it. */
  readonly clan?: string;
  /** A trump card: usable once per fight. */
  readonly oncePerFight?: true;
  /** What using it costs its user once the fight is over (validated: trump cards only). */
  readonly afterCost?: CostTemplate;
}

/** Techniques the character has mastered, plus partial study progress on others. */
export interface TechniqueBook {
  readonly known: readonly string[];
  readonly progress: Readonly<Record<string, number>>;
}

export const EMPTY_BOOK: TechniqueBook = { known: [], progress: {} };

export type LearnBlocker =
  | { readonly kind: 'already-known' }
  | { readonly kind: 'clan'; readonly clan: string }
  | { readonly kind: 'requirements'; readonly unmet: readonly StatId[] };

export function learnBlocker(
  book: TechniqueBook,
  def: TechniqueDef,
  stats: Stats,
  clanId: string,
): LearnBlocker | null {
  if (book.known.includes(def.id)) return { kind: 'already-known' };
  if (def.clan !== undefined && def.clan !== clanId) return { kind: 'clan', clan: def.clan };
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
