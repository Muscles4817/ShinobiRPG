import {
  conductMark,
  endRun,
  nextStage,
  withConduct,
  withNotes,
  type ConductSignal,
  type ExamExit,
  type SurvivalStageDef,
} from '@/systems/exams';
import { startRun, type Crew } from '@/systems/missions';

import type { GameContext } from '../context';
import { adjust, log, spendTime } from '../ops';
import type { GameState } from '../state';
import { examHere, examNight, withRun } from './current';

/**
 * The survival stage: the forest is an exam-only team mission of encounters against rival teams
 * (`MissionDef.examOnly`), so recon, being spotted, approaches and fights all work as on any
 * job. The mission's ends come back here instead of paying or failing a job: clearing it brings
 * the token through, anything else puts the team out of the exam.
 */

function survivalHere(state: GameState, ctx: GameContext) {
  const here = examHere(state, ctx);
  return here?.stage?.kind === 'survival' ? { ...here, stage: here.stage } : null;
}

/** Into the forest: the stage's mission begins (its slots and energy are charged now). */
export function enterForest(state: GameState, ctx: GameContext): GameState {
  const here = survivalHere(state, ctx);
  if (!here || here.run.progress?.kind !== 'survival') return state;
  const def = ctx.content.missions.require(here.stage.missionId);
  const run = { ...here.run, progress: { kind: 'survival' as const, started: true } };
  // The genin sitting the exam together go in together; no sensei follows them.
  const examCrew: Crew = { kind: 'exam-team', leaderId: null, memberIds: here.run.teamIds };
  const started = adjust(
    spendTime({ ...withRun(state, run), mission: startRun(def, examCrew) }, def.slots, ctx),
    {
      energy: -def.energyCost,
    },
  );
  return log(started, { heading: here.stage.name, text: def.summary, tone: 'info' });
}

/** The forest cleared with the token: through to the next stage after a night's rest. */
export function forestCleared(state: GameState, ctx: GameContext): GameState {
  const here = survivalHere(state, ctx);
  const left = { ...state, mission: null };
  if (!here) return left;
  const passed = withNotes(here.run, { kind: 'outcome', text: here.stage.passed });
  return examNight(withRun(left, nextStage(here.def, passed)), ctx);
}

/** Out of the forest without the token: the exam is over for your team. */
export function forestLost(state: GameState, ctx: GameContext, exit: ExamExit): GameState {
  const here = survivalHere(state, ctx);
  const left = { ...state, mission: null, combat: null };
  if (!here) return left;
  return withRun(left, endRun(withNotes(here.run, failedNote(here.stage)), exit));
}

function failedNote(stage: SurvivalStageDef) {
  return { kind: 'outcome' as const, text: stage.failed };
}

/** Notes a judgement signal on the run you are sitting, if any. */
export function markConduct(state: GameState, signal: ConductSignal): GameState {
  const run = state.exams.run;
  return run ? withRun(state, withConduct(run, conductMark(signal))) : state;
}

/** Whether you are in the forest right now (its mission under way). */
export function inForest(state: GameState, ctx: GameContext): boolean {
  return survivalHere(state, ctx) !== null && state.mission !== null;
}

/**
 * After a won fight in the forest, the examiners note whether your whole team is still on its
 * feet. `allies` is each teammate's health share at the end.
 */
export function noteForestFight(
  state: GameState,
  ctx: GameContext,
  allies: readonly number[],
): GameState {
  if (!survivalHere(state, ctx)) return state;
  const down = allies.some((health) => health <= 0);
  return markConduct(state, down ? 'teammate-down' : 'team-standing');
}
