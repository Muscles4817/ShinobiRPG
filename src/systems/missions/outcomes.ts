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
  /** Effects on you or the crew, for the game layer: bond, harm, energy. */
  readonly personal: readonly Effect[];
}

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

/** An outcome applied at the run's current stage. */
export function applyOutcome(
  run: MissionRun,
  def: StoryDef,
  outcome: Outcome | undefined,
  fallback: LedgerTone = 'plain',
): Applied {
  const effects = outcome?.effects ?? [];
  const changed = effects.reduce((r, e) => applyOne(r, def, e), run);
  const personal = effects.filter(
    (e) => e.kind === 'bond' || e.kind === 'harm' || e.kind === 'energy',
  );
  if (!outcome?.ledger) return { run: changed, personal };
  const pay = payOf(effects);
  const line = {
    stageIndex: run.stageIndex,
    text: outcome.ledger,
    tone: toneOf(effects, fallback),
    ...(pay !== 0 ? { pay } : {}),
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
