/**
 * Long stories: an arc is a chain of jobs in acts, told over weeks between everything else.
 * Each act's jobs are open together, in any order, once the act before is passed; the arc
 * stands where its first act not yet passed is. An act is passed by every job (the default),
 * by any one of them (leads: the rest stay open as extra digging until a later act's job is
 * done), or by one (a fork: taking one closes the others). Acts follow Harmon's story circle (`beat`:
 * you, need, go, search, find, take, return, change), so an arc reads as a story, not a list.
 */

export const ARC_BEATS = [
  'you',
  'need',
  'go',
  'search',
  'find',
  'take',
  'return',
  'change',
] as const;
export type ArcBeat = (typeof ARC_BEATS)[number];

export interface ArcAct {
  /** Where in the story circle the act stands. */
  readonly beats: readonly ArcBeat[];
  readonly title: string;
  /** What is going on, for the arc's card on the board. No numbers. */
  readonly text: string;
  /** The jobs of the act (mission ids), open together. */
  readonly jobs: readonly string[];
  /**
   * The town the act is lived in: its jobs are posted at the office there, and while the act
   * is open, going there is orders (no leave needed). Absent: the village.
   */
  readonly baseLocationId?: string;
  /** How the act is passed: `all` its jobs (the default), `any` one of them, or `one` (a fork). */
  readonly pass?: ActPass;
}

export const ACT_PASSES = ['all', 'any', 'one'] as const;
export type ActPass = (typeof ACT_PASSES)[number];

/** The towns where an arc's current act is based, across every arc. */
export function arcBases(arcs: readonly ArcDef[], completed: readonly string[]): string[] {
  return arcs.flatMap((arc) => {
    const base = arc.acts[actReached(arc, completed)]?.baseLocationId;
    return base === undefined ? [] : [base];
  });
}

/**
 * Someone who puts a genin forward for chūnin once the arc is done (`game/exam/routes.ts`):
 * who, and what is said at the ceremony. No numbers.
 */
export interface ArcRecommendation {
  readonly personId: string;
  readonly words: string;
}

export interface ArcDef {
  readonly id: string;
  readonly title: string;
  readonly summary: string;
  readonly acts: readonly ArcAct[];
  readonly recommends?: ArcRecommendation;
}

/** Whether an act is behind you: every job done, or (for leads and forks) any one. */
export function actPassed(act: ArcAct, completed: readonly string[]): boolean {
  const done = (id: string) => completed.includes(id);
  return (act.pass ?? 'all') === 'all' ? act.jobs.every(done) : act.jobs.some(done);
}

/** The act an arc stands at: the first not yet passed (`acts.length` when finished). */
export function actReached(arc: ArcDef, completed: readonly string[]): number {
  const open = arc.acts.findIndex((act) => !actPassed(act, completed));
  return open === -1 ? arc.acts.length : open;
}

/** The arc and act a job belongs to, if any. */
export function arcPlace(
  arcs: readonly ArcDef[],
  missionId: string,
): { readonly arc: ArcDef; readonly act: number } | null {
  for (const arc of arcs) {
    const act = arc.acts.findIndex((a) => a.jobs.includes(missionId));
    if (act >= 0) return { arc, act };
  }
  return null;
}

/**
 * Whether an arc's job is open: it isn't done, and its act is the one the arc stands at, or a
 * passed act of leads whose story hasn't moved on yet (no later act's job is done).
 */
export function arcJobOpen(
  arcs: readonly ArcDef[],
  missionId: string,
  completed: readonly string[],
): boolean {
  const place = arcPlace(arcs, missionId);
  if (!place || completed.includes(missionId)) return false;
  const reached = actReached(place.arc, completed);
  if (place.act === reached) return true;
  return place.act < reached && leadStillOpen(place.arc, place.act, completed);
}

/** A lead of a passed act stays open until a job of a later act is done. */
function leadStillOpen(arc: ArcDef, act: number, completed: readonly string[]): boolean {
  if (arc.acts[act]?.pass !== 'any') return false;
  return !arc.acts.slice(act + 1).some((a) => a.jobs.some((id) => completed.includes(id)));
}
