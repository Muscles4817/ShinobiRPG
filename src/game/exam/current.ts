import {
  currentExamStage,
  withNotes,
  type ExamDef,
  type ExamRun,
  type ExamStageDef,
} from '@/systems/exams';
import { slotsUntilNextMorning } from '@/systems/time';
import { METER_MAX, sleepRecovery } from '@/systems/vitals';

import type { GameContext } from '../context';
import { sleepChakra } from '../injuries';
import { adjust, spendTime } from '../ops';
import type { GameState } from '../state';
import { chakraBody } from '../hives/hive';

/** The exam you are sitting, gathered in one place: its definition, run and current stage. */
export interface ExamHere {
  readonly def: ExamDef;
  readonly run: ExamRun;
  /** Null once the run is over and its verdict waits to be heard. */
  readonly stage: ExamStageDef | null;
}

export function examHere(state: GameState, ctx: GameContext): ExamHere | null {
  const run = state.exams.run;
  if (!run) return null;
  const def = ctx.content.exams.require(run.examId);
  return { def, run, stage: currentExamStage(def, run) };
}

export function withRun(state: GameState, run: ExamRun): GameState {
  return { ...state, exams: { ...state.exams, run } };
}

/** Adds lines to the exam's story. */
export function noted(state: GameState, run: ExamRun, ...lines: readonly string[]): GameState {
  return withRun(state, withNotes(run, ...lines.map((text) => ({ kind: 'story' as const, text }))));
}

/**
 * A night between stages: the exam board beds and feeds its candidates, so you wake rested and
 * fed for the next one (your wounds mend only as much as a night's sleep mends them).
 */
export function examNight(state: GameState, ctx: GameContext): GameState {
  const { vitals } = state.character;
  const night = sleepChakra(state);
  const rested = spendTime(state, slotsUntilNextMorning(state.time), ctx);
  return adjust(rested, {
    ...sleepRecovery(vitals, chakraBody(state)),
    chakra: night.chakra,
    satiety: METER_MAX - rested.character.vitals.satiety,
  });
}
