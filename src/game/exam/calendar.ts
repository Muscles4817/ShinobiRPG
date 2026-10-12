import type { RumourDef } from '@/content';
import type { ExamDef } from '@/systems/exams';
import { nextRank } from '@/systems/standing';
import { daysUntil } from '@/systems/time';

import type { GameContext } from '../context';
import type { GameState } from '../state';

/**
 * When exams are held. Like festivals, they come round on the calendar (twice a year, on the
 * dates content gives) and are talked about in the week before: the village gossips and your
 * sensei says their piece. Only the exam for the rank above yours concerns you.
 */

/** An exam is talked about this many days ahead. */
export const EXAM_NOTICE_DAYS = 7;

export interface ExamSitting {
  readonly exam: ExamDef;
  /** 0 = today. */
  readonly daysAway: number;
}

/** Exams that would promote you one rank. */
function examsForYou(state: GameState, ctx: GameContext): readonly ExamDef[] {
  const next = nextRank(state.standing.rank);
  return ctx.content.exams.all.filter((e) => e.rank === next);
}

/** The next sitting of an exam for your rank (today's, if one is held today). */
export function nextSitting(state: GameState, ctx: GameContext): ExamSitting | null {
  const sittings = examsForYou(state, ctx).flatMap((exam) =>
    exam.dates.map((date) => ({ exam, daysAway: daysUntil(state.time.day, date) })),
  );
  return [...sittings].sort((a, b) => a.daysAway - b.daysAway)[0] ?? null;
}

/** The exam held today, if there is one for your rank. */
export function examToday(state: GameState, ctx: GameContext): ExamDef | null {
  const next = nextSitting(state, ctx);
  return next?.daysAway === 0 ? next.exam : null;
}

/** The coming exam, once it is close enough to be talked about. */
export function examAnnounced(state: GameState, ctx: GameContext): ExamSitting | null {
  const next = nextSitting(state, ctx);
  return next && next.daysAway <= EXAM_NOTICE_DAYS ? next : null;
}

/** The gossip about a coming exam, in the week before it. */
export function examRumours(state: GameState, ctx: GameContext): RumourDef[] {
  const coming = examAnnounced(state, ctx);
  if (!coming || coming.daysAway === 0) return [];
  return [{ id: `exam-${coming.exam.id}`, text: coming.exam.rumour }];
}
