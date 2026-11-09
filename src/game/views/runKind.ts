import type { MissionDef, MissionRun } from '@/systems/missions';

/** What kind of run this is, said above a scene and mid-sentence: a journey, a venture or a job. */
export interface RunKind {
  /** "A journey of your own". */
  readonly kicker: string;
  /** "on a journey of your own". */
  readonly onIt: string;
}

export function runKind(run: MissionRun, def: MissionDef): RunKind {
  if (run.journey) return { kicker: 'A journey of your own', onIt: 'on a journey of your own' };
  if (run.venture) return { kicker: 'Off the paths', onIt: 'off the paths' };
  const job = `${def.rank}-rank mission for ${def.client}`;
  return { kicker: job, onIt: `on a ${job}` };
}
