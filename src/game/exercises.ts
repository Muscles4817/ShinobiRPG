import type { ExerciseDef } from '@/content';
import type { Rng } from '@/core';
import { STAT_GRADES, statTier } from '@/systems/stats';

import { withBreakthrough } from './breakthroughs';
import type { GameContext } from './context';
import type { GameState } from './state';

/**
 * Chakra control exercises, learned over sessions (`ExerciseDef`). A session's progress is the
 * exercise's pace × your talent for chakra control × how far your control is past the grade it
 * needs; early on a session may end in a fall (a little harm, a little progress all the same).
 * At full progress the exercise is mastered: a breakthrough (`exercise:<id>`) that moves your
 * control limit and, for walking, opens the way across a surface (`walking.ts`).
 */

export const FULL_PROGRESS = 100;
/** Each grade of control past the one the exercise needs speeds you up this much. */
export const GRADE_PACE = 0.25;
/** The chance a session ends in a fall when you start; it shrinks as you get better. */
export const FALL_CHANCE = 0.35;
/** Health a fall costs. */
export const FALL_HARM = 4;
/** A fall still teaches you this share of a session's progress. */
export const FALL_SHARE = 0.4;

export function breakthroughSource(exercise: ExerciseDef): string {
  return `exercise:${exercise.id}`;
}

export function progressOf(state: GameState, exerciseId: string): number {
  return state.character.exercises?.[exerciseId] ?? 0;
}

export function hasMastered(state: GameState, exercise: ExerciseDef): boolean {
  return state.character.breakthroughs.some((b) => b.source === breakthroughSource(exercise));
}

/** Grades of chakra control past what the exercise needs (negative: not enough yet). */
function gradesPast(state: GameState, exercise: ExerciseDef): number {
  const grade = statTier(state.character.stats.chakraControl).grade;
  return STAT_GRADES.indexOf(grade) - STAT_GRADES.indexOf(exercise.minControl);
}

/** Why you can't practise this yet (control, your sensei), or null. Energy is the action's. */
export function exerciseBlocker(state: GameState, exercise: ExerciseDef): string | null {
  if (hasMastered(state, exercise)) return `You have mastered ${exercise.name}.`;
  if (gradesPast(state, exercise) < 0)
    return `${exercise.name} takes chakra control at grade ${exercise.minControl}.`;
  if (exercise.startedBy === 'sensei' && progressOf(state, exercise.id) === 0)
    return `Your sensei starts ${exercise.name} with you at a weekly lesson.`;
  return null;
}

/** Progress one good session gives. */
export function sessionProgress(state: GameState, exercise: ExerciseDef): number {
  const talent = state.character.aptitude.chakraControl;
  const pace = 1 + GRADE_PACE * Math.max(0, gradesPast(state, exercise));
  return Math.max(1, Math.round(exercise.progressPerSession * talent * pace));
}

export interface Session {
  readonly state: GameState;
  readonly fell: boolean;
  readonly mastered: boolean;
  /** The line for it: a fall, how far along you are, or mastery. */
  readonly text: string;
}

function withProgress(state: GameState, exercise: ExerciseDef, progress: number): GameState {
  const exercises = { ...state.character.exercises, [exercise.id]: progress };
  return { ...state, character: { ...state.character, exercises } };
}

/** Where you are, in a line: the first, middle or last of the exercise's practice lines. */
function practiceLine(exercise: ExerciseDef, progress: number): string {
  const stage = Math.min(2, Math.floor((progress / FULL_PROGRESS) * 3));
  return exercise.lines.practice[stage] ?? exercise.lines.practice[0];
}

/** One session: progress (less after a fall), and mastery at the top. */
export function practiseSession(state: GameState, exercise: ExerciseDef, rng: Rng): Session {
  const before = progressOf(state, exercise.id);
  const fell = rng.chance(FALL_CHANCE * (1 - before / FULL_PROGRESS));
  const gain = sessionProgress(state, exercise) * (fell ? FALL_SHARE : 1);
  const progress = Math.min(FULL_PROGRESS, Math.round(before + gain));
  const moved = withProgress(state, exercise, progress);
  if (progress < FULL_PROGRESS) {
    const text = fell ? exercise.lines.fall : practiceLine(exercise, progress);
    return { state: moved, fell, mastered: false, text };
  }
  const limits = { source: breakthroughSource(exercise), limits: exercise.limitBonus };
  const character = withBreakthrough(moved.character, limits);
  return { state: { ...moved, character }, fell, mastered: true, text: exercise.lines.mastered };
}

/** Your sensei starts an exercise with you: the first session's progress, as a lesson. */
export function startedAtLesson(state: GameState, exercise: ExerciseDef): GameState {
  return withProgress(
    state,
    exercise,
    Math.min(FULL_PROGRESS - 1, sessionProgress(state, exercise)),
  );
}

/** The exercise your sensei would start with you at this lesson, if one is due. */
export function dueAtLesson(state: GameState, ctx: GameContext): ExerciseDef | null {
  return (
    ctx.content.exercises.all.find(
      (e) =>
        e.startedBy === 'sensei' &&
        progressOf(state, e.id) === 0 &&
        !hasMastered(state, e) &&
        gradesPast(state, e) >= 0,
    ) ?? null
  );
}
