import {
  currentStage,
  holds,
  type MissionDef,
  type MissionRun,
  type StoryState,
} from '@/systems/missions';

/**
 * Where the story stands, and keeping the run on a stage that applies. A stage whose `when`
 * doesn't hold is passed over as if it weren't written, so the run always rests on a stage
 * that plays (or on the end).
 */

export function storyOf(run: MissionRun): StoryState {
  return { marks: run.marks, threads: run.threads, crew: run.crew };
}

/** The run moved past every stage ahead of it that doesn't apply. */
export function settle(def: MissionDef, run: MissionRun): MissionRun {
  let settled = run;
  for (
    let stage = currentStage(def, settled);
    stage && !holds(storyOf(settled), stage.when);
    stage = currentStage(def, settled)
  ) {
    settled = { ...settled, stageIndex: settled.stageIndex + 1 };
  }
  return settled;
}
