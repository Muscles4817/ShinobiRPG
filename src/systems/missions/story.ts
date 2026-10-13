import type { Crew } from './crew';

/**
 * What a mission remembers as it goes, and the rules for reading and changing it. Marks are
 * named flags ("knows-why", "night-road", a twist); threads are small counters with a word for
 * each level (a charge's trust, the day's light). Conditions read them (and who is along);
 * effects change them, or ask the game layer to (harm, energy, time, bond). Everything that
 * changes the outcome writes a ledger line, so the debrief can say what happened and why.
 */

/** A counter a mission keeps, shown as its level's word and dots: "At ease ●●○". */
export interface ThreadDef {
  readonly id: string;
  /** Whose or what it is: "Kohaku's trust", "Daylight". */
  readonly label: string;
  /** A word for each level, lowest first: ['Doubtful', 'Polite', 'At ease', 'Trusts you']. */
  readonly levels: readonly string[];
  /** The level it starts at (an index into `levels`). */
  readonly start: number;
}

/** Who must be along (or not) for a condition to hold. */
export type CrewCondition = 'solo' | 'team' | 'you-lead' | 'led';

export type Condition =
  | { readonly has: string }
  | { readonly lacks: string }
  | { readonly thread: string; readonly atLeast: number }
  | { readonly thread: string; readonly below: number }
  | { readonly crew: CrewCondition }
  | { readonly all: readonly Condition[] }
  | { readonly any: readonly Condition[] };

export type Effect =
  | { readonly kind: 'mark'; readonly mark: string }
  | { readonly kind: 'thread'; readonly thread: string; readonly by: number }
  /** Bond with everyone along (not whoever leads). */
  | { readonly kind: 'bond'; readonly by: number }
  /** Health lost (no numbers in the story: the chip shows it). */
  | { readonly kind: 'harm'; readonly health: number }
  | { readonly kind: 'energy'; readonly by: number }
  /** A share of the posted pay won or lost (-0.25 docks a quarter), with the reason. */
  | { readonly kind: 'pay'; readonly share: number }
  /** Something the village will remember after the job: follow-up jobs and gossip read it. */
  | { readonly kind: 'world'; readonly mark: string }
  /** A moment everyone along will remember, as a phrase ("the night below the pass"). */
  | { readonly kind: 'memory'; readonly text: string };

/** How a ledger line reads in the debrief: something gained, something lost, or what happened. */
export type LedgerTone = 'gain' | 'cost' | 'plain';

/** One line of the job as it went, for the debrief. */
export interface LedgerLine {
  readonly stageIndex: number;
  readonly text: string;
  readonly tone: LedgerTone;
  /** The share of the pay it moved, if it moved any. */
  readonly pay?: number;
}

/** What the story so far is: the run's marks and threads, and who went. */
export interface StoryState {
  readonly marks: readonly string[];
  readonly threads: Readonly<Record<string, number>>;
  readonly crew: Crew;
}

function crewHolds(crew: Crew, want: CrewCondition): boolean {
  switch (want) {
    case 'solo':
      return crew.kind === 'solo';
    case 'team':
      return crew.kind !== 'solo';
    case 'you-lead':
      return crew.leaderId === null;
    case 'led':
      return crew.leaderId !== null;
  }
}

/** Whether a condition holds for the story so far (no condition always holds). */
export function holds(story: StoryState, condition: Condition | undefined): boolean {
  if (!condition) return true;
  if ('has' in condition) return story.marks.includes(condition.has);
  if ('lacks' in condition) return !story.marks.includes(condition.lacks);
  if ('crew' in condition) return crewHolds(story.crew, condition.crew);
  if ('all' in condition) return condition.all.every((c) => holds(story, c));
  if ('any' in condition) return condition.any.some((c) => holds(story, c));
  const level = story.threads[condition.thread] ?? 0;
  return 'atLeast' in condition ? level >= condition.atLeast : level < condition.below;
}

/** The first text whose condition holds, or the plain text. */
export function variantText(
  story: StoryState,
  text: string,
  variants: readonly { readonly when: Condition; readonly text: string }[] | undefined,
): string {
  return variants?.find((v) => holds(story, v.when))?.text ?? text;
}

/** Threads at their starting levels. */
export function startThreads(threads: readonly ThreadDef[]): Record<string, number> {
  return Object.fromEntries(threads.map((t) => [t.id, t.start]));
}

/** A thread moved, kept within its levels. */
export function moveThread(
  levels: Readonly<Record<string, number>>,
  def: ThreadDef,
  by: number,
): Record<string, number> {
  const now = levels[def.id] ?? def.start;
  const next = Math.min(def.levels.length - 1, Math.max(0, now + by));
  return { ...levels, [def.id]: next };
}

/** Marks with one more (once). */
export function withMark(marks: readonly string[], mark: string): readonly string[] {
  return marks.includes(mark) ? marks : [...marks, mark];
}

/** Every mark and thread a condition reads, for validation. */
export function conditionRefs(condition: Condition | undefined): {
  readonly marks: string[];
  readonly threads: string[];
} {
  if (!condition) return { marks: [], threads: [] };
  if ('has' in condition) return { marks: [condition.has], threads: [] };
  if ('lacks' in condition) return { marks: [condition.lacks], threads: [] };
  if ('crew' in condition) return { marks: [], threads: [] };
  if ('all' in condition || 'any' in condition) {
    const parts = ('all' in condition ? condition.all : condition.any).map(conditionRefs);
    return {
      marks: parts.flatMap((p) => p.marks),
      threads: parts.flatMap((p) => p.threads),
    };
  }
  return { marks: [], threads: [condition.thread] };
}
