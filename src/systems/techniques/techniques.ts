import { round1 } from '@/core';
import type { StatGrade, Stats } from '@/systems/stats';

import type { CostTemplate } from './costs';
import type { MoveDistance, TechniqueEffect } from './effects';
import type { LadderStep } from './ladders';
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
  /** Insects it spends from its user's hive (`CombatSwarm`), beside its chakra. */
  readonly swarmCost?: number;
  /** Dust it spends from what its user commands (`CombatDust`), beside its chakra. */
  readonly dustCost?: number;
  /** Dust it pulls up from the ground into its user's command (a draw), before anything else. */
  readonly dustDraw?: number;
  /** How advanced it is, in the letters of ability grades (see `learning.ts`). */
  readonly rank: StatGrade;
  /** What the body must have to use it at all, whatever the learner's grade. */
  readonly needs?: TechniqueNeeds;
  /** Total study points needed to master it. */
  readonly difficulty: number;
  /** Only members of this clan may learn it. */
  readonly clan?: string;
  /**
   * The style it belongs to ("Lantern Wind"), taught by that school's teachers rather than
   * shelved for everyone. Absent for standard techniques.
   */
  readonly school?: string;
  /** A trump card: usable once per fight. */
  readonly oncePerFight?: true;
  /** What using it costs its user once the fight is over (validated: trump cards only). */
  readonly afterCost?: CostTemplate;
  /**
   * A combination technique: playable only beside a fighter on your side who knows the partner
   * technique (and isn't dazed); both go off together, harder than either alone.
   */
  readonly combo?: { readonly partnerTechniqueId: string };
  /** The distances it works at, when not its art's usual reach (a throw: close only). */
  readonly reach?: readonly MoveDistance[];
  /** How hard it is to slip: sure, steady (the default) or wild (`ACCURACIES`). */
  readonly accuracy?: Accuracy;
  /** A step of a ladder that must be open in the fight to use it (`ladders.ts`): a gate. */
  readonly needsOpen?: LadderStep;
  /**
   * A taijutsu move that moulds chakra (a Gentle Fist palm, an expansion, a strike charged to a
   * point): it costs chakra like any jutsu, where a plain body move costs breath.
   */
  readonly moulded?: true;
}

/**
 * How surely a technique lands. Sure ones (lightning, iaido, pressure points) are harder to
 * dodge; wild ones (big swings) are easier to slip but hit harder when they land. The numbers
 * live once in the combat system's `rules/defence.ts`.
 */
export const ACCURACIES = ['sure', 'steady', 'wild'] as const;
export type Accuracy = (typeof ACCURACIES)[number];

/** Weapons a technique can need in hand: a blade for the sword arts, knuckles for some fists. */
export const NEEDED_WEAPONS = ['blade', 'knuckles'] as const;
export type NeededWeapon = (typeof NEEDED_WEAPONS)[number];

/**
 * Hard requirements where the body must have something: a chakra nature, deep enough reserves,
 * a grade of chakra control, a weapon in hand. (A clan or bloodline is `TechniqueDef.clan`.)
 */
export interface TechniqueNeeds {
  readonly nature?: Element;
  readonly minReserves?: number;
  readonly control?: StatGrade;
  readonly weapon?: NeededWeapon;
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
  /**
   * The body moves a plain strike plays from, as the player chose them (a fight's
   * `CombatantSetup.repertoire`); null: the fight keeps their best.
   */
  readonly repertoire: readonly string[] | null;
  /**
   * The chains of body moves (opener first) the player built (a fight's
   * `CombatantSetup.chains`); null: the fight builds them from what they know.
   */
  readonly chains: readonly (readonly string[])[] | null;
}

export const EMPTY_BOOK: TechniqueBook = {
  known: [],
  progress: {},
  unstable: [],
  repertoire: null,
  chains: null,
};

/** Who is learning: what their grades, clan, nature and the weapon in their hand allow. */
export interface Learner {
  readonly stats: Stats;
  readonly clanId: string;
  /** Null until the chakra paper has told them (nothing that needs a nature can be learned). */
  readonly nature: Element | null;
  /** The held weapon's shape (null: empty hands); absent when gear isn't known. */
  readonly held?: string | null;
}

export type LearnBlocker =
  | { readonly kind: 'already-known' }
  | { readonly kind: 'clan'; readonly clan: string }
  | { readonly kind: 'rank'; readonly rank: StatGrade; readonly grade: StatGrade }
  | { readonly kind: 'nature'; readonly nature: Element }
  | { readonly kind: 'reserves'; readonly min: number; readonly have: number }
  | { readonly kind: 'control'; readonly grade: StatGrade; readonly have: StatGrade }
  | { readonly kind: 'weapon'; readonly weapon: NeededWeapon };

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
  if (needs.weapon !== undefined && learner.held !== undefined && learner.held !== needs.weapon) {
    return { kind: 'weapon', weapon: needs.weapon };
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

/** Someone using a technique: their grades and clan, and their nature when it is known. */
export interface Performer {
  readonly stats: Stats;
  readonly clanId: string;
  /** Left out when their nature isn't modelled: a nature need is then not held against them. */
  readonly nature?: Element;
}

/**
 * Whether someone can do a technique themselves, to fight with it or to teach it: steadily (its
 * rank at or below their grade in its art, never a rank above), within its clan, and with the
 * control and reserves it needs. A weapon need isn't held against them; they're armed for it.
 */
export function canPerform(def: TechniqueDef, performer: Performer): boolean {
  if (def.clan !== undefined && def.clan !== performer.clanId) return false;
  if (learnabilityFor(def, performer.stats) !== 'normal') return false;
  if (!def.needs) return true;
  const nature = performer.nature ?? def.needs.nature ?? null;
  return (
    needsBlocker(def.needs, { stats: performer.stats, clanId: performer.clanId, nature }) === null
  );
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
      ...book,
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
