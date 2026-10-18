import type { MissionDef, MissionRun } from './missions';
import { moveThread, withMark, type Effect, type LedgerTone } from './story';
import type { Outcome } from './storyStages';

/**
 * Applying what a result does. The run's own memory (marks, threads, the pay) changes here; what
 * touches the character or the crew (harm, energy, bond) is handed back for the game layer to
 * apply. Every outcome with a ledger line is written into the ledger, with the pay it moved.
 */

/** The parts of a job an outcome reads: its threads, and who the charge is. */
export type StoryDef = Pick<MissionDef, 'threads' | 'charge'>;

export interface Applied {
  readonly run: MissionRun;
  /** Effects for the game layer: bond, harm, energy, and what the village remembers or counts. */
  readonly personal: readonly Effect[];
}

/** Effects for the game layer: on you, the crew, or the village's memory. */
const PERSONAL: readonly Effect['kind'][] = ['bond', 'harm', 'energy', 'world', 'memory', 'tally'];

/** A thread named in an effect: `charge` is the charge's trust, whatever its thread's id. */
function threadOf(def: StoryDef, id: string) {
  const real = id === 'charge' ? def.charge?.thread : id;
  return def.threads?.find((t) => t.id === real);
}

function applyOne(run: MissionRun, def: StoryDef, effect: Effect): MissionRun {
  switch (effect.kind) {
    case 'mark':
      return { ...run, marks: withMark(run.marks, effect.mark) };
    case 'thread': {
      // A thread this job doesn't keep (a road event's, say) is simply not there to move.
      const thread = threadOf(def, effect.thread);
      return thread ? { ...run, threads: moveThread(run.threads, thread, effect.by) } : run;
    }
    case 'pay':
      return { ...run, rewardMultiplier: Math.max(0, run.rewardMultiplier + effect.share) };
    case 'bond':
    case 'harm':
    case 'energy':
    case 'world':
    case 'memory':
    case 'tally':
      return run;
  }
}

/** How a ledger line reads, from what its effects did. */
function toneOf(effects: readonly Effect[], fallback: LedgerTone): LedgerTone {
  const pay = payOf(effects);
  if (pay < 0 || effects.some((e) => e.kind === 'harm')) return 'cost';
  return pay > 0 ? 'gain' : fallback;
}

function payOf(effects: readonly Effect[]): number {
  return effects.reduce((sum, e) => sum + (e.kind === 'pay' ? e.share : 0), 0);
}

/**
 * What the ledger says a thread did, for each thread the outcome really moved: a line never
 * claims a change that didn't happen (a road event's lost hour, on a job that keeps no light).
 */
function threadClauses(
  before: MissionRun,
  after: MissionRun,
  def: StoryDef,
  effects: readonly Effect[],
): string[] {
  return effects.flatMap((e) => {
    if (e.kind !== 'thread') return [];
    const thread = threadOf(def, e.thread);
    if (!thread?.ledger) return [];
    const moved = (after.threads[thread.id] ?? 0) - (before.threads[thread.id] ?? 0);
    const said = moved < 0 ? thread.ledger.fell : moved > 0 ? thread.ledger.rose : undefined;
    return said ? [nextTelling(before, said)] : [];
  });
}

/** The first of a thread's ways of saying it, then the next each time the ledger says it again. */
function nextTelling(run: MissionRun, said: string | readonly string[]): string {
  const ways = typeof said === 'string' ? [said] : said;
  const before = run.ledger.filter((l) => ways.some((w) => l.text.endsWith(w))).length;
  return ways[Math.min(before, ways.length - 1)] ?? '';
}

/** An outcome applied at the run's current stage. */
export function applyOutcome(
  run: MissionRun,
  def: StoryDef,
  outcome: Outcome | undefined,
  fallback: LedgerTone = 'plain',
): Applied {
  const effects = outcome?.effects ?? [];
  const changed = effects.reduce((r, e) => applyOne(r, def, e), run);
  const personal = effects.filter((e) => PERSONAL.includes(e.kind));
  if (!outcome?.ledger) return { run: changed, personal };
  const pay = payOf(effects);
  const line = {
    stageIndex: run.stageIndex,
    text: [outcome.ledger, ...new Set(threadClauses(run, changed, def, effects))].join(' '),
    tone: toneOf(effects, fallback),
    ...(pay !== 0 ? { pay } : {}),
    ...(outcome.noted ? { noted: true as const } : {}),
  };
  return { run: { ...changed, ledger: [...changed.ledger, line] }, personal };
}

/** A line written straight into the ledger, for what the rules did themselves. */
export function addLedger(
  run: MissionRun,
  line: { readonly text: string; readonly tone: LedgerTone; readonly pay?: number },
): MissionRun {
  return { ...run, ledger: [...run.ledger, { stageIndex: run.stageIndex, ...line }] };
}
